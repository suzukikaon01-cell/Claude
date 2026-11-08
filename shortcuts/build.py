#!/usr/bin/env python3
"""生成两个记账快捷指令（未签名），供 macOS `shortcuts sign` 签名。
不含任何密钥：首次安装时 iPhone 会弹出“导入问题”，让用户粘贴设置页复制的记账地址。"""
import plistlib, sys, uuid, os

OBJ = '￼'

def text(s, attachments=None):
    v = {'string': s}
    if attachments:
        v['attachmentsByRange'] = attachments
    return {'Value': v, 'WFSerializationType': 'WFTextTokenString'}

def ext_prop(name):
    return {'Type': 'ExtensionInput', 'Aggrandizements': [{'Type': 'WFPropertyVariableAggrandizement', 'PropertyName': name}]}

def action_out(uid, name):
    return {'Type': 'ActionOutput', 'OutputUUID': uid, 'OutputName': name}

def var(attachment):
    return {'Value': attachment, 'WFSerializationType': 'WFTextTokenAttachment'}

def dict_field(items):
    return {'Value': {'WFDictionaryFieldValueItems': [
        {'WFItemType': 0, 'WFKey': text(k), 'WFValue': v} for k, v in items]},
        'WFSerializationType': 'WFDictionaryFieldValue'}

def shortcut(actions, url_action_index, question, inputs=None):
    return {
        'WFWorkflowClientVersion': '2605.0.5', 'WFWorkflowMinimumClientVersion': 900,
        'WFWorkflowMinimumClientVersionString': '900',
        'WFWorkflowIcon': {'WFWorkflowIconStartColor': 431817727, 'WFWorkflowIconGlyphNumber': 59511},
        'WFWorkflowTypes': [], 'WFWorkflowHasShortcutInputVariables': bool(inputs),
        'WFWorkflowInputContentItemClasses': inputs or [],
        'WFWorkflowOutputContentItemClasses': [],
        'WFWorkflowImportQuestions': [{
            'ActionIndex': url_action_index, 'Category': 'Parameter', 'ParameterKey': 'WFURL',
            'Text': question, 'DefaultValue': ''}],
        'WFWorkflowActions': actions,
    }

def post(url_uid, body_type, **extra):
    p = {'UUID': url_uid, 'WFURL': '', 'WFHTTPMethod': 'POST', 'WFHTTPBodyType': body_type, 'ShowHeaders': False}
    p.update(extra)
    return {'WFWorkflowActionIdentifier': 'is.workflow.actions.downloadurl', 'WFWorkflowActionParameters': p}

def notify(body):
    return {'WFWorkflowActionIdentifier': 'is.workflow.actions.notification',
            'WFWorkflowActionParameters': {'WFNotificationActionBody': body, 'WFNotificationActionSound': False}}

def wallet():
    # 由“电子钱包”自动化运行，输入为交易：加盟店／金額／カードまたはパス
    body = dict_field([
        ('text', text(f'{OBJ}で{OBJ}を支払いました', {'{0, 1}': ext_prop('Merchant'), '{2, 1}': ext_prop('Amount')})),
        ('app', text(OBJ, {'{0, 1}': ext_prop('Card or Pass')})),
        ('raw', text(OBJ, {'{0, 1}': {'Type': 'ExtensionInput'}})),
    ])
    return shortcut([post(str(uuid.uuid4()).upper(), 'JSON', WFJSONValues=body)], 0,
                    '粘贴设置页复制的「自动记账地址」', inputs=['WFGenericFileContentItem', 'WFStringContentItem', 'WFContentItem'])

def screenshot():
    shot, ocr, req = (str(uuid.uuid4()).upper() for _ in range(3))
    return shortcut([
        {'WFWorkflowActionIdentifier': 'is.workflow.actions.takescreenshot', 'WFWorkflowActionParameters': {'UUID': shot}},
        {'WFWorkflowActionIdentifier': 'is.workflow.actions.extracttextfromimage',
         'WFWorkflowActionParameters': {'UUID': ocr, 'WFImage': var(action_out(shot, '屏幕快照'))}},
        post(req, 'File', WFRequestVariable=var(action_out(ocr, '图像中的文本'))),
        notify(text(f'已发送到账本：{OBJ}', {'{7, 1}': action_out(req, 'URL的内容')})),
    ], 2, '粘贴设置页复制的「截图记账地址」')

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'build'
    os.makedirs(out, exist_ok=True)
    for name, data in (('wallet', wallet()), ('screenshot', screenshot())):
        with open(os.path.join(out, f'{name}.shortcut'), 'wb') as f:
            plistlib.dump(data, f, fmt=plistlib.FMT_BINARY)
        print('built', name)
