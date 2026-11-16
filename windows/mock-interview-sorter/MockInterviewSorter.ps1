<#
  模拟面试反馈自动整理（Windows，PowerShell 5.1+，无需安装）
  - 监视桌面：文件名含“模拟面试/面试反馈/模擬面接”的文件，保存完成后自动移走
  - 移到  C:\Users\HLT\Desktop\私塾\模拟面试\<日期>\<原名>_<学生名>_<时间>.<扩展名>
  - 学生名从知日塾教务系统当天的课表推断：
      保存时刻所在的那节课开始不足 SwitchMinutes 分钟 → 属于上一节课的学生
      （例：第 2 节课开始 10 分钟时保存 → 学生 1）；否则属于当前/刚结束这节课的学生
  用法：
    首次设置密码： powershell -ExecutionPolicy Bypass -File MockInterviewSorter.ps1 -Setup
    只整理一次：   powershell -ExecutionPolicy Bypass -File MockInterviewSorter.ps1 -Once
    后台常驻：     powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File MockInterviewSorter.ps1
    预览匹配：     powershell -ExecutionPolicy Bypass -File MockInterviewSorter.ps1 -WhoAt "2026-11-16 14:10"
#>
param([switch]$Setup, [switch]$Once, [string]$WhoAt)

# ===== 设置 =====
$Desktop       = [Environment]::GetFolderPath('Desktop')
$Target        = 'C:\Users\HLT\Desktop\私塾\模拟面试'
# 文件名含任一关键词即整理（面试稿、面谈建议、愿书、各大学面试材料等）
$Keywords      = @('面试', '面試', '面接', '面谈', '面談', '模拟', '模擬', '愿书', '願書', '志望理由', '大学', '大學')
$ExcludePrefix = @('G', 'SNS')   # 以这些开头的文件不整理（不区分大小写）
$Extensions    = @('.doc', '.docx', '.pdf', '.pages', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx')
$SwitchMinutes = 30            # 一节课开始后多少分钟内保存的反馈，算上一节课的
$BaseUrl       = 'https://app.lesson-desk.workers.dev'
$PollSeconds   = 5
$InterviewCats = @('interview', 'one_to_one_interview')   # 优先匹配模拟面试/1v1面试课
# ================

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$AppDir   = Join-Path $env:APPDATA 'MockInterviewSorter'
$PassFile = Join-Path $AppDir 'password.dat'
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
$LogFile  = Join-Path $AppDir 'sorter.log'

function Log($msg) {
  $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
  Write-Host $line
}

# ---------- 密码（Windows DPAPI 加密，只有本机本用户能解密）----------
if ($Setup -or -not (Test-Path $PassFile)) {
  $sec = Read-Host '请输入知日塾教务系统的教师登录密码' -AsSecureString
  $sec | ConvertFrom-SecureString | Set-Content -Path $PassFile -Encoding ASCII
  Write-Host '已保存（加密）。'
  if ($Setup) { exit 0 }
}
function Get-Password {
  $sec = Get-Content $PassFile | ConvertTo-SecureString
  [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

# ---------- 教务系统 ----------
$script:Session = $null
$script:Cache = @{}

function Read-Utf8Json($resp) {
  $ms = New-Object IO.MemoryStream
  $resp.RawContentStream.Position = 0
  $resp.RawContentStream.CopyTo($ms)
  [Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json
}

$script:LoginPausedUntil = [datetime]::MinValue
function Connect-Edu {
  # 登录失败后暂停，避免触发教务系统“15 分钟 8 次”的登录限制（会连带锁住浏览器登录）
  if ((Get-Date) -lt $script:LoginPausedUntil) {
    throw ('登录已暂停到 {0:HH:mm}（{1}）' -f $script:LoginPausedUntil, $script:LoginPauseReason)
  }
  $body = [Text.Encoding]::UTF8.GetBytes((@{ password = (Get-Password); remember = $true } | ConvertTo-Json))
  try {
    Invoke-WebRequest -Uri "$BaseUrl/api/login" -Method Post -Body $body -ContentType 'application/json; charset=utf-8' `
      -SessionVariable s -UseBasicParsing | Out-Null
  } catch {
    $code = $null; if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    if ($code -eq 401) {
      $script:LoginPausedUntil = (Get-Date).AddHours(6)
      $script:LoginPauseReason = '密码错误：请重新双击「安装.bat」输入正确密码'
    } elseif ($code -eq 429) {
      $script:LoginPausedUntil = (Get-Date).AddMinutes(16)
      $script:LoginPauseReason = '教务系统提示尝试次数过多，16 分钟后自动重试'
    } else {
      $script:LoginPausedUntil = (Get-Date).AddMinutes(2)
      $script:LoginPauseReason = "网络或服务器错误（$code），2 分钟后重试"
    }
    throw ('登录失败：{0}' -f $script:LoginPauseReason)
  }
  $script:Session = $s
}

function Get-MonthReport([string]$month) {
  $c = $script:Cache[$month]
  if ($c -and ((Get-Date) - $c.At).TotalMinutes -lt 5) { return $c.Data }
  for ($try = 0; $try -lt 2; $try++) {
    if (-not $script:Session) { Connect-Edu }
    try {
      $r = Invoke-WebRequest -Uri "$BaseUrl/api/income/month?month=$month" -WebSession $script:Session -UseBasicParsing
      $data = Read-Utf8Json $r
      $script:Cache[$month] = @{ At = Get-Date; Data = $data }
      return $data
    } catch {
      $code = $null; if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
      if ($code -eq 401 -and $try -eq 0) { $script:Session = $null; continue }
      throw
    }
  }
}

function Get-DayLessons([datetime]$t) {
  $rep = Get-MonthReport ($t.ToString('yyyy-MM'))
  $day = $rep.days | Where-Object { $_.day -eq $t.ToString('yyyy-MM-dd') } | Select-Object -First 1
  if (-not $day) { return @() }
  $list = if ($day.gross_lessons) { $day.gross_lessons } else { $day.lessons }
  $list = @($list | Where-Object { -not $_.cancelled -and $_.student })
  $iv = @($list | Where-Object { $InterviewCats -contains $_.category })
  if ($iv.Count) { $list = $iv }
  @($list | ForEach-Object {
      [pscustomobject]@{
        Student = $_.student
        Start   = [datetime]::ParseExact($t.ToString('yyyy-MM-dd') + ' ' + $_.start, 'yyyy-MM-dd HH:mm', $null)
        Finish  = [datetime]::ParseExact($t.ToString('yyyy-MM-dd') + ' ' + $_.finish, 'yyyy-MM-dd HH:mm', $null)
      } } | Sort-Object Start)
}

# 本月和上月教过的所有学生（用于识别文件名里已经写了的学生名）
function Get-KnownStudents([datetime]$t) {
  $names = @()
  foreach ($m in @($t.ToString('yyyy-MM'), $t.AddMonths(-1).ToString('yyyy-MM'))) {
    $rep = Get-MonthReport $m
    foreach ($d in $rep.days) {
      $list = if ($d.gross_lessons) { $d.gross_lessons } else { $d.lessons }
      $names += @($list | Where-Object { $_.student } | ForEach-Object { $_.student })
    }
  }
  # 名字长的优先，避免短名字误匹配
  @($names | Sort-Object -Unique | Sort-Object { $_.Length } -Descending)
}

# 返回 @{ Student; Reason }
function Find-Student([datetime]$t) {
  $lessons = Get-DayLessons $t
  $started = @($lessons | Where-Object { $_.Start -le $t })
  if (-not $started.Count) { return @{ Student = $null; Reason = '当天这个时间之前没有课' } }
  $i = $started.Count - 1
  $cur = $started[$i]
  $mins = ($t - $cur.Start).TotalMinutes
  if ($mins -lt $SwitchMinutes -and $i -gt 0) {
    $prev = $started[$i - 1]
    return @{ Student = $prev.Student; Reason = ('{0} 的课开始 {1:N0} 分钟内保存 → 上一节 {2}（{3:HH:mm}-{4:HH:mm}）' -f $cur.Student, $mins, $prev.Student, $prev.Start, $prev.Finish) }
  }
  @{ Student = $cur.Student; Reason = ('{0}（{1:HH:mm}-{2:HH:mm}）' -f $cur.Student, $cur.Start, $cur.Finish) }
}

# ---------- 文件处理 ----------
function Test-Ready([IO.FileInfo]$f) {
  if (((Get-Date) - $f.LastWriteTime).TotalSeconds -lt 8) { return $false }   # 还在保存
  try { $s = $f.Open('Open', 'Read', 'None'); $s.Close(); return $true } catch { return $false }  # 仍被 Word 等占用
}

function Get-SafeName([string]$s) {
  foreach ($c in [IO.Path]::GetInvalidFileNameChars()) { $s = $s.Replace([string]$c, '_') }
  $s.Trim()
}

function Move-Feedback([IO.FileInfo]$f) {
  $t = $f.LastWriteTime
  try {
    $named = Get-KnownStudents $t | Where-Object { $f.BaseName.Contains($_) -or $f.BaseName.Contains(($_ -replace '\s', '')) } | Select-Object -First 1
    if ($named) { $m = @{ Student = $named; Reason = '文件名里已有学生名'; InName = $true } } else { $m = Find-Student $t }
  } catch {
    $msg = $_.Exception.Message
    if ($msg -ne $script:LastError) { Log ("读取教务课表失败，文件先留在桌面：{0}" -f $msg); $script:LastError = $msg }
    return
  }
  $script:LastError = $null
  $student = if ($m.Student) { Get-SafeName $m.Student } else { '未知学生' }
  $dir = Join-Path $Target ($t.ToString('yyyy-MM-dd'))
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $base = if ($m.InName) { '{0}_{1}' -f $f.BaseName, $t.ToString('HHmm') } else { '{0}_{1}_{2}' -f $f.BaseName, $student, $t.ToString('HHmm') }
  $dest = Join-Path $dir ($base + $f.Extension)
  $n = 2
  while (Test-Path -LiteralPath $dest) { $dest = Join-Path $dir ('{0}({1}){2}' -f $base, $n, $f.Extension); $n++ }
  Move-Item -LiteralPath $f.FullName -Destination $dest
  Log ('{0}  →  {1}    [{2}]' -f $f.Name, $dest, $m.Reason)
}

function Invoke-Scan {
  Get-ChildItem -LiteralPath $Desktop -File | Where-Object {
    $name = $_.Name
    -not $name.StartsWith('~$') -and ($Extensions -contains $_.Extension.ToLower()) -and
    -not ($ExcludePrefix | Where-Object { $name.StartsWith($_, [StringComparison]::OrdinalIgnoreCase) }) -and
    ($Keywords | Where-Object { $name -like "*$_*" })
  } | ForEach-Object { if (Test-Ready $_) { Move-Feedback $_ } }
}

# ---------- 入口 ----------
if ($WhoAt) {
  $t = [datetime]::Parse($WhoAt)
  trap { Write-Host ('出错：{0}' -f $_.Exception.Message) -ForegroundColor Red; exit 1 }
  Get-DayLessons $t | Format-Table Student, @{n='开始';e={$_.Start.ToString('HH:mm')}}, @{n='结束';e={$_.Finish.ToString('HH:mm')}}
  $m = Find-Student $t
  Write-Host ('{0:yyyy-MM-dd HH:mm} 保存的反馈 → {1}    [{2}]' -f $t, $(if ($m.Student) { $m.Student } else { '未知学生' }), $m.Reason)
  exit 0
}
if ($Once) { Invoke-Scan; exit 0 }

# 只允许一个实例
$mutex = New-Object Threading.Mutex($false, 'Global\MockInterviewSorter')
if (-not $mutex.WaitOne(0)) { exit 0 }
Log "开始监视桌面：$Desktop"
while ($true) {
  try { Invoke-Scan } catch { Log ("出错：{0}" -f $_.Exception.Message) }
  Start-Sleep -Seconds $PollSeconds
}
