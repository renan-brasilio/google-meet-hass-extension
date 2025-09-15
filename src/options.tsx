import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Config, defaultConfig, loadConfig, saveConfig, validateConfig, UpdateMethod } from "./config";
import { testConnection, TestResult } from "./hass";

// Simple translation function with language detection
const getLanguage = (): string => {
    // Check if user has set a language preference
    const savedLang = localStorage.getItem('extension-language');
    if (savedLang) {
        // If user selected "follow browser", detect browser language
        if (savedLang === 'follow-browser') {
            return detectBrowserLanguage();
        }
        return savedLang;
    }

    // Default to follow browser language
    return detectBrowserLanguage();
};

// Supported languages mapping
const supportedLanguages = {
    'en': { native: 'English', english: 'English' },
    'pt-br': { native: 'Português (Brasil)', english: 'Brazilian Portuguese' },
    'pt': { native: 'Português', english: 'Portuguese' },
    'es': { native: 'Español', english: 'Spanish' },
    'fr': { native: 'Français', english: 'French' },
    'de': { native: 'Deutsch', english: 'German' },
    'zh': { native: '中文', english: 'Chinese' },
    'ja': { native: '日本語', english: 'Japanese' },
    'ko': { native: '한국어', english: 'Korean' },
    'ar': { native: 'العربية', english: 'Arabic' },
    'hi': { native: 'हिन्दी', english: 'Hindi' },
    'ru': { native: 'Русский', english: 'Russian' }
};

// Detect browser language and return supported language or English
const detectBrowserLanguage = (): string => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt-br')) return 'pt-br';
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('ar')) return 'ar';
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('ru')) return 'ru';
    return 'en'; // Default to English
};

const t = (key: string): string => {
    const language = getLanguage();

    const translations: Record<string, Record<string, string>> = {
        en: {
            'options.updateMethod': 'Update Method',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'Home Assistant Base URL',
            'options.hostUrlHelp': 'No trailing slashes, example: http://homeassistant.local',
            'options.authToken': 'Authorization Token',
            'options.entityId': 'Entity ID',
            'options.webhookUrl': 'Webhook URL',
            'options.webhookUrlHelp': 'Full webhook URL including entity ID, example: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Check <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">this guide</a> for more information.',
            'options.test': 'Test',
            'options.save': 'Save',
            'options.configurationSaved': 'Configuration saved!',
            'options.language': 'Language',
            'options.authTokenPlaceholder': 'Your long-lived access token',
            'options.authTokenHelp': 'Your long-lived access token. To generate, see <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">this guide</a>.',
            'options.entityIdHelp': 'The entity ID to update when joining/leaving meetings. Example: input_boolean.in_meeting',
            'options.languageSaved': 'Language preference saved!',
            'options.followBrowser': 'Follow browser language',
            'test.testing': 'Testing...'
        },
        'pt-br': {
            'options.updateMethod': 'Método de Atualização',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'URL Base do Home Assistant',
            'options.hostUrlHelp': 'Sem barras no final, exemplo: http://homeassistant.local',
            'options.authToken': 'Token de Autorização',
            'options.entityId': 'ID da Entidade',
            'options.webhookUrl': 'URL do Webhook',
            'options.webhookUrlHelp': 'URL completa do webhook incluindo ID da entidade, exemplo: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Consulte <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">este guia</a> para mais informações.',
            'options.test': 'Testar',
            'options.save': 'Salvar',
            'options.configurationSaved': 'Configuração salva!',
            'options.language': 'Idioma',
            'options.authTokenPlaceholder': 'Seu token de acesso de longa duração',
            'options.languageSaved': 'Preferência de idioma salva!',
            'options.authTokenHelp': 'Seu token de acesso de longa duração. Para gerar, consulte <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">este guia</a>.',
            'options.entityIdHelp': 'O ID da entidade para atualizar ao entrar/sair de reuniões. Exemplo: input_boolean.in_meeting',
            'options.followBrowser': 'Seguir idioma do navegador',
            'test.testing': 'Testando...'
        },
        pt: {
            'options.updateMethod': 'Método de Actualização',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'URL Base do Home Assistant',
            'options.hostUrlHelp': 'Sem barras no final, exemplo: http://homeassistant.local',
            'options.authToken': 'Token de Autorização',
            'options.entityId': 'ID da Entidade',
            'options.webhookUrl': 'URL do Webhook',
            'options.webhookUrlHelp': 'URL completa do webhook incluindo ID da entidade, exemplo: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Consulte <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">este guia</a> para mais informações.',
            'options.test': 'Testar',
            'options.save': 'Guardar',
            'options.configurationSaved': 'Configuração guardada!',
            'options.language': 'Idioma',
            'options.authTokenPlaceholder': 'O seu token de acesso de longa duração',
            'options.languageSaved': 'Preferência de idioma guardada!',
            'options.authTokenHelp': 'O seu token de acesso de longa duração. Para gerar, consulte <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">este guia</a>.',
            'options.entityIdHelp': 'O ID da entidade para actualizar ao entrar/sair de reuniões. Exemplo: input_boolean.in_meeting',
            'options.followBrowser': 'Seguir idioma do navegador',
            'test.testing': 'A testar...'
        },
        es: {
            'options.updateMethod': 'Método de Actualización',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'URL Base de Home Assistant',
            'options.hostUrlHelp': 'Sin barras al final, ejemplo: http://homeassistant.local',
            'options.authToken': 'Token de Autorización',
            'options.entityId': 'ID de Entidad',
            'options.webhookUrl': 'URL del Webhook',
            'options.webhookUrlHelp': 'URL completa del webhook incluyendo ID de entidad, ejemplo: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Consulta <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">esta guía</a> para más información.',
            'options.test': 'Probar',
            'options.save': 'Guardar',
            'options.configurationSaved': '¡Configuración guardada!',
            'options.language': 'Idioma',
            'options.authTokenPlaceholder': 'Tu token de acceso de larga duración',
            'options.languageSaved': '¡Preferencia de idioma guardada!',
            'options.authTokenHelp': 'Tu token de acceso de larga duración. Para generar, consulta <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">esta guía</a>.',
            'options.entityIdHelp': 'El ID de entidad para actualizar al unirse/salir de reuniones. Ejemplo: input_boolean.in_meeting',
            'options.followBrowser': 'Seguir idioma del navegador',
            'test.testing': 'Probando...'
        },
        fr: {
            'options.updateMethod': 'Méthode de Mise à Jour',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'URL de Base Home Assistant',
            'options.hostUrlHelp': 'Pas de barres obliques à la fin, exemple: http://homeassistant.local',
            'options.authToken': 'Token d\'Autorisation',
            'options.entityId': 'ID d\'Entité',
            'options.webhookUrl': 'URL du Webhook',
            'options.webhookUrlHelp': 'URL complète du webhook incluant l\'ID d\'entité, exemple: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Consultez <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">ce guide</a> pour plus d\'informations.',
            'options.test': 'Tester',
            'options.save': 'Enregistrer',
            'options.configurationSaved': 'Configuration enregistrée !',
            'options.language': 'Langue',
            'options.authTokenPlaceholder': 'Votre token d\'accès à long terme',
            'options.languageSaved': 'Préférence de langue enregistrée !',
            'options.authTokenHelp': 'Votre token d\'accès à long terme. Pour générer, consultez <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">ce guide</a>.',
            'options.entityIdHelp': 'L\'ID d\'entité à mettre à jour lors de l\'entrée/sortie de réunions. Exemple: input_boolean.in_meeting',
            'options.followBrowser': 'Suivre la langue du navigateur',
            'test.testing': 'Test en cours...'
        },
        de: {
            'options.updateMethod': 'Update-Methode',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'Home Assistant Basis-URL',
            'options.hostUrlHelp': 'Keine Schrägstriche am Ende, Beispiel: http://homeassistant.local',
            'options.authToken': 'Autorisierungs-Token',
            'options.entityId': 'Entitäts-ID',
            'options.webhookUrl': 'Webhook-URL',
            'options.webhookUrlHelp': 'Vollständige Webhook-URL einschließlich Entitäts-ID, Beispiel: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Siehe <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">diese Anleitung</a> für weitere Informationen.',
            'options.test': 'Testen',
            'options.save': 'Speichern',
            'options.configurationSaved': 'Konfiguration gespeichert!',
            'options.language': 'Sprache',
            'options.authTokenPlaceholder': 'Ihr langfristiger Zugriffstoken',
            'options.languageSaved': 'Spracheinstellung gespeichert!',
            'options.authTokenHelp': 'Ihr langfristiger Zugriffstoken. Zum Generieren siehe <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">diese Anleitung</a>.',
            'options.entityIdHelp': 'Die Entitäts-ID zum Aktualisieren beim Beitreten/Verlassen von Meetings. Beispiel: input_boolean.in_meeting',
            'options.followBrowser': 'Browser-Sprache folgen',
            'test.testing': 'Testen...'
        },
        zh: {
            'options.updateMethod': '更新方法',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'Home Assistant 基础 URL',
            'options.hostUrlHelp': '末尾不要斜杠，例如：http://homeassistant.local',
            'options.authToken': '授权令牌',
            'options.entityId': '实体 ID',
            'options.webhookUrl': 'Webhook URL',
            'options.webhookUrlHelp': '完整的 webhook URL，包括实体 ID，例如：https://ha.example.com/api/webhook/entity_webhook。<br/><br/>查看 <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">此指南</a> 了解更多信息。',
            'options.test': '测试',
            'options.save': '保存',
            'options.configurationSaved': '配置已保存！',
            'options.language': '语言',
            'options.authTokenPlaceholder': '您的长期访问令牌',
            'options.languageSaved': '语言偏好已保存！',
            'options.authTokenHelp': '您的长期访问令牌。要生成，请参阅 <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">此指南</a>.',
            'options.entityIdHelp': '加入/离开会议时要更新的实体ID。例如：input_boolean.in_meeting',
            'options.followBrowser': '跟随浏览器语言',
            'test.testing': '测试中...'
        },
        ja: {
            'options.updateMethod': '更新方法',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'Home Assistant ベース URL',
            'options.hostUrlHelp': '末尾にスラッシュなし、例：http://homeassistant.local',
            'options.authToken': '認証トークン',
            'options.entityId': 'エンティティ ID',
            'options.webhookUrl': 'Webhook URL',
            'options.webhookUrlHelp': 'エンティティ ID を含む完全な webhook URL、例：https://ha.example.com/api/webhook/entity_webhook。<br/><br/>詳細は <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">このガイド</a> をご覧ください。',
            'options.test': 'テスト',
            'options.save': '保存',
            'options.configurationSaved': '設定が保存されました！',
            'options.language': '言語',
            'options.authTokenPlaceholder': 'あなたの長期アクセストークン',
            'options.languageSaved': '言語設定が保存されました！',
            'options.authTokenHelp': 'あなたの長期アクセストークン。生成するには、<a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">このガイド</a>を参照してください.',
            'options.entityIdHelp': '会議に参加/退出する際に更新するエンティティID。例：input_boolean.in_meeting',
            'options.followBrowser': 'ブラウザの言語に従う',
            'test.testing': 'テスト中...'
        },
        ko: {
            'options.updateMethod': '업데이트 방법',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'Home Assistant 기본 URL',
            'options.hostUrlHelp': '끝에 슬래시 없음, 예: http://homeassistant.local',
            'options.authToken': '인증 토큰',
            'options.entityId': '엔티티 ID',
            'options.webhookUrl': 'Webhook URL',
            'options.webhookUrlHelp': '엔티티 ID를 포함한 전체 webhook URL, 예: https://ha.example.com/api/webhook/entity_webhook。<br/><br/>자세한 내용은 <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">이 가이드</a>를 참조하세요.',
            'options.test': '테스트',
            'options.save': '저장',
            'options.configurationSaved': '구성이 저장되었습니다!',
            'options.language': '언어',
            'options.authTokenPlaceholder': '장기 액세스 토큰',
            'options.languageSaved': '언어 설정이 저장되었습니다!',
            'options.authTokenHelp': '장기 액세스 토큰. 생성하려면 <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">이 가이드</a>를 참조하세요.',
            'options.entityIdHelp': '회의 참가/퇴장 시 업데이트할 엔티티 ID. 예: input_boolean.in_meeting',
            'options.followBrowser': '브라우저 언어 따르기',
            'test.testing': '테스트 중...'
        },
        ar: {
            'options.updateMethod': 'طريقة التحديث',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'رابط Home Assistant الأساسي',
            'options.hostUrlHelp': 'بدون شرطات في النهاية، مثال: http://homeassistant.local',
            'options.authToken': 'رمز التفويض',
            'options.entityId': 'معرف الكيان',
            'options.webhookUrl': 'رابط Webhook',
            'options.webhookUrlHelp': 'رابط webhook كامل يتضمن معرف الكيان، مثال: https://ha.example.com/api/webhook/entity_webhook.<br/><br/>راجع <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">هذا الدليل</a> لمزيد من المعلومات.',
            'options.test': 'اختبار',
            'options.save': 'حفظ',
            'options.configurationSaved': 'تم حفظ التكوين!',
            'options.language': 'اللغة',
            'options.authTokenPlaceholder': 'رمز الوصول طويل المدى',
            'options.languageSaved': 'تم حفظ تفضيل اللغة!',
            'options.authTokenHelp': 'رمز الوصول طويل المدى. لإنشاء واحد، راجع <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">هذا الدليل</a>.',
            'options.entityIdHelp': 'معرف الكيان لتحديثه عند الانضمام/مغادرة الاجتماعات. مثال: input_boolean.in_meeting',
            'options.followBrowser': 'اتباع لغة المتصفح',
            'test.testing': 'جاري الاختبار...'
        },
        hi: {
            'options.updateMethod': 'अपडेट विधि',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'Home Assistant बेस URL',
            'options.hostUrlHelp': 'अंत में स्लैश नहीं, उदाहरण: http://homeassistant.local',
            'options.authToken': 'प्राधिकरण टोकन',
            'options.entityId': 'एंटिटी ID',
            'options.webhookUrl': 'Webhook URL',
            'options.webhookUrlHelp': 'एंटिटी ID सहित पूरा webhook URL, उदाहरण: https://ha.example.com/api/webhook/entity_webhook.<br/><br/>अधिक जानकारी के लिए <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">इस गाइड</a> देखें।',
            'options.test': 'परीक्षण',
            'options.save': 'सहेजें',
            'options.configurationSaved': 'कॉन्फ़िगरेशन सहेजा गया!',
            'options.language': 'भाषा',
            'options.authTokenPlaceholder': 'आपका दीर्घकालिक पहुंच टोकन',
            'options.languageSaved': 'भाषा वरीयता सहेजी गई!',
            'options.authTokenHelp': 'आपका दीर्घकालिक पहुंच टोकन। उत्पन्न करने के लिए, <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">इस गाइड</a> को देखें।',
            'options.entityIdHelp': 'मीटिंग में शामिल होने/छोड़ने पर अपडेट करने के लिए इकाई ID। उदाहरण: input_boolean.in_meeting',
            'options.followBrowser': 'ब्राउज़र भाषा का पालन करें',
            'test.testing': 'परीक्षण कर रहे हैं...'
        },
        ru: {
            'options.updateMethod': 'Метод обновления',
            'options.api': 'API',
            'options.webhook': 'Webhook',
            'options.hostUrl': 'Базовый URL Home Assistant',
            'options.hostUrlHelp': 'Без слешей в конце, пример: http://homeassistant.local',
            'options.authToken': 'Токен авторизации',
            'options.entityId': 'ID сущности',
            'options.webhookUrl': 'URL Webhook',
            'options.webhookUrlHelp': 'Полный URL webhook включая ID сущности, пример: https://ha.example.com/api/webhook/entity_webhook.<br/><br/>См. <a href="https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger" target="_blank" rel="noopener noreferrer">это руководство</a> для получения дополнительной информации.',
            'options.test': 'Тест',
            'options.save': 'Сохранить',
            'options.configurationSaved': 'Конфигурация сохранена!',
            'options.language': 'Язык',
            'options.authTokenPlaceholder': 'Ваш долгосрочный токен доступа',
            'options.languageSaved': 'Настройка языка сохранена!',
            'options.authTokenHelp': 'Ваш долгосрочный токен доступа. Для создания см. <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noopener noreferrer">это руководство</a>.',
            'options.entityIdHelp': 'ID сущности для обновления при присоединении/выходе из встреч. Пример: input_boolean.in_meeting',
            'options.followBrowser': 'Следовать языку браузера',
            'test.testing': 'Тестирование...'
        }
    };

    return translations[language]?.[key] || translations['en'][key] || key;
};

/**
 * Lightweight options styles
 */
const optionsStyles = `
    .options-container {
        width: 500px;
        padding: 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #fff;
        box-sizing: border-box;
        height: auto;
        min-height: 600px;
        overflow: visible;
        display: flex;
        flex-direction: column;
    }
    .options-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e0e0e0;
    }
    .options-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
    .form-section {
        margin-bottom: 16px;
    }
    .form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 6px;
    }
    .form-field {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
        margin-bottom: 6px;
    }
    .form-field:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
    .form-helper {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
    }
    .radio-group {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
    }
    .radio-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .radio-input {
        margin: 0;
    }
    .radio-label {
        font-size: 14px;
        color: #333;
        cursor: pointer;
    }
    .form-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .button-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
        flex-shrink: 0;
    }
    .button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .button-primary {
        background: #1976d2;
        color: white;
    }
    .button-primary:hover:not(:disabled) {
        background: #1565c0;
    }
    .button-primary:disabled {
        background: #ccc;
        color: #666;
        cursor: not-allowed;
    }
    .button-secondary {
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
    }
    .button-secondary:hover:not(:disabled) {
        background: #e0e0e0;
    }
    .button-secondary:disabled {
        background: #f5f5f5;
        color: #999;
        cursor: not-allowed;
    }
    .loading {
        opacity: 0.6;
        pointer-events: none;
    }
    .message {
        padding: 12px;
        border-radius: 4px;
        margin: 16px 0;
        font-size: 14px;
    }
    .message-success {
        background: #e8f5e8;
        color: #2e7d32;
        border: 1px solid #c8e6c9;
    }
    .message-error {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #ffcdd2;
    }
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .message-info {
        background: #e3f2fd;
        color: #1976d2;
        border: 1px solid #bbdefb;
    }
    .password-toggle {
        position: relative;
    }
    .password-toggle input {
        padding-right: 40px;
    }
    .password-toggle-button {
        position: absolute;
        right: 12px;
        top: 31%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: #666;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .password-toggle-button:hover {
        color: #333;
    }
    .eye-icon {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    .language-selector {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
    }
    .language-select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        background: white;
    }
`;

/**
 * Lightweight options component
 */
const Options = () => {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const [originalConfig, setOriginalConfig] = useState<Config>(defaultConfig);
    const [saved, setSaved] = useState<boolean>(false);
    const [testStatus, setTestStatus] = useState<'not-tested' | 'testing' | 'complete'>('not-tested');
    const [testResult, setTestResult] = useState<TestResult>({
        success: false,
        message: "Testing...",
    });
    const [showToken, setShowToken] = useState<boolean>(false);
    const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
        const savedLang = localStorage.getItem('extension-language');
        return savedLang || 'follow-browser';
    });
    const [showLanguageToast, setShowLanguageToast] = useState<boolean>(false);

    /**
     * Populate the previous configuration on load
     */
    useEffect(() => {
        loadConfig().then((loadedConfig) => {
            setConfig(loadedConfig);
            setOriginalConfig(loadedConfig);
        }).catch((error) => {
            console.error("Error loading config:", error);
            setConfig(defaultConfig);
            setOriginalConfig(defaultConfig);
        });
    }, []);

    /**
     * Tests the connection to Home Assistant
     */
    const test = async () => {
        setTestStatus('testing');
        const result = await testConnection(config);
        setTestResult(result);
        setTestStatus('complete');
    };

    /**
     * Saves the configuration to Chrome storage
     */
    const save = async () => {
        await saveConfig(config);
        setOriginalConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    /**
     * Handle language change
     */
    const handleLanguageChange = (language: string) => {
        localStorage.setItem('extension-language', language);
        setCurrentLanguage(language);
        // Show toast notification
        setShowLanguageToast(true);
        // Hide toast after 3 seconds
        setTimeout(() => setShowLanguageToast(false), 3000);
    };



    /**
     * Check if configuration has changed
     */
    const hasConfigChanged = (): boolean => {
        return JSON.stringify(config) !== JSON.stringify(originalConfig);
    };

    /**
     * Check if required fields are filled
     */
    const areRequiredFieldsFilled = (): boolean => {
        const validation = validateConfig(config);
        return validation.isValid;
    };

    /**
     * Check if there is enough information to test
     */
    const hasUrlToTest = (): boolean => {
        if (config.method === "api") {
            return (
                config.host.trim() !== "" &&
                config.entity_id.trim() !== "" &&
                config.token.trim() !== "" &&
                config.token !== "xxxxxxx"
            );
        } else {
            return config.webhook_url.trim() !== "";
        }
    };

    return (
        <>
            <style>{optionsStyles}</style>
            {showLanguageToast && (
                <div className="toast">
                    {t('options.languageSaved')}
                </div>
            )}
            <div className="options-container">
                <div className="form-content">
                    {/* Language Selector */}
                    <div className="language-selector">
                        <label className="form-label">{t('options.language')}</label>
                        <select
                            className="language-select"
                            value={currentLanguage}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                            <option value="follow-browser">{t('options.followBrowser')} ({detectBrowserLanguage()})</option>
                            {Object.entries(supportedLanguages).map(([code, lang]) => (
                                <option key={code} value={code}>
                                    {lang.native} ({lang.english})
                                </option>
                            ))}
                        </select>
                    </div>

                {/* Update Method */}
                <div className="form-section">
                    <label className="form-label">{t('options.updateMethod')}</label>
                    <div className="radio-group">
                        <div className="radio-item">
                            <input
                                type="radio"
                                id="method-api"
                                name="method"
                                value="api"
                                checked={config.method === "api"}
                                onChange={(e) => setConfig({ ...config, method: e.target.value as UpdateMethod })}
                                className="radio-input"
                            />
                            <label htmlFor="method-api" className="radio-label">{t('options.api')}</label>
                        </div>
                        <div className="radio-item">
                            <input
                                type="radio"
                                id="method-webhook"
                                name="method"
                                value="webhook"
                                checked={config.method === "webhook"}
                                onChange={(e) => setConfig({ ...config, method: e.target.value as UpdateMethod })}
                                className="radio-input"
                            />
                            <label htmlFor="method-webhook" className="radio-label">{t('options.webhook')}</label>
                        </div>
                    </div>
                </div>

                {/* API Configuration */}
                {config.method === "api" && (
                    <>
                        <div className="form-section">
                            <label htmlFor='host' className='form-label'>{t('options.hostUrl')} *</label>
                            <input
                                id="host"
                                type="text"
                                value={config.host}
                                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                className="form-field"
                                placeholder="http://homeassistant.local"
                            />
                            <div className="form-helper" dangerouslySetInnerHTML={{ __html: t('options.hostUrlHelp') }}></div>
                        </div>

                        <div className="form-section">
                            <label htmlFor='token' className='form-label'>{t('options.authToken')} *</label>
                            <div className="password-toggle">
                                <input
                                    id="token"
                                    type={showToken ? "text" : "password"}
                                    value={config.token}
                                    onChange={(e) => setConfig({ ...config, token: e.target.value })}
                                    className="form-field"
                                    placeholder={t('options.authTokenPlaceholder')}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-button"
                                    onClick={() => setShowToken(!showToken)}
                                >
                                    {showToken ? (
                                        <svg className="eye-icon" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    ): (
                                        <svg className="eye-icon" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    )}
                                </button>
                                <div className="form-helper" dangerouslySetInnerHTML={{ __html: t('options.authTokenHelp') }}></div>
                            </div>
                        </div>

                        <div className="form-section">
                            <label htmlFor='entity_id' className='form-label'>{t('options.entityId')} *</label>
                            <input
                                id="entity_id"
                                type="text"
                                value={config.entity_id}
                                onChange={(e) => setConfig({ ...config, entity_id: e.target.value })}
                                className="form-field"
                                placeholder="input_boolean.in_meeting"
                            />
                            <div className="form-helper">{t('options.entityIdHelp')}</div>
                        </div>
                    </>
                )}

                {/* Webhook Configuration */}
                {config.method === "webhook" && (
                    <div className="form-section">
                        <label htmlFor="webhook_url" className="form-label">{t('options.webhookUrl')} *</label>
                        <input
                            id="webhook_url"
                            type="text"
                            value={config.webhook_url}
                            onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                            className="form-field"
                            placeholder="https://ha.example.com/api/webhook/entity_webhook"
                        />
                        <div className="form-helper" dangerouslySetInnerHTML={{ __html: t('options.webhookUrlHelp') }}></div>
                    </div>
                )}

                {/* Messages */}
                {saved && (
                    <div className="message message-success">
                        {t('options.configurationSaved')}
                    </div>
                )}

                {testStatus === 'complete' && (
                    <div className={`message ${testResult.success ? 'message-success' : 'message-error'}`}>
                        {testResult.message}
                    </div>
                )}

                </div>

                {/* Buttons */}
                <div className="button-group">
                    {hasUrlToTest() && (
                        <button
                            className="button button-secondary"
                            onClick={test}
                            disabled={testStatus === 'testing'}
                        >
                            {testStatus === 'testing' ? 'Testing...' : 'Test'}
                        </button>
                    )}
                        <button
                            className="button button-primary"
                            onClick={save}
                            disabled={!hasConfigChanged() || !areRequiredFieldsFilled()}
                        >
                            {t('options.save')}
                        </button>
                </div>
            </div>
        </>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
    document.getElementById("root")
);
