/**
 * System Information Utility
 * Collects debug information for bug reports using browser APIs
 */

/**
 * Get application version from package.json
 */
export const getAppVersion = (): string => {
    return import.meta.env.VITE_APP_VERSION || '1.0.0';
};

/**
 * Get OS information from navigator (improved detection)
 */
export const getOSInfo = (): string => {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';

    // OS判定 (Androidは「Linux」も含むので先に判定)
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    else if (ua.indexOf('Android') !== -1) os = 'Android';
    else if (ua.indexOf('like Mac') !== -1) os = 'iOS'; // iPadも含む
    else if (ua.indexOf('Mac') !== -1) os = 'macOS';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';

    // バージョン情報を追加取得
    let version = '';
    if (os === 'macOS') {
        const match = ua.match(/Mac OS X ([0-9_]+)/);
        if (match) version = ' ' + match[1].replace(/_/g, '.');
    } else if (os === 'Windows') {
        const match = ua.match(/Windows NT ([0-9.]+)/);
        if (match) version = ' NT ' + match[1];
    }

    return os + version;
};

/**
 * Get screen resolution with device pixel ratio (Retina support)
 */
export const getScreenResolution = (): string => {
    const width = window.screen.width;
    const height = window.screen.height;
    const ratio = window.devicePixelRatio || 1;
    return `${width}x${height} (@${ratio}x)`;
};

/**
 * Get browser information (improved detection)
 */
export const getBrowserInfo = (): string => {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';

    // ブラウザ判定（順番が重要: EdgeはChromeを含む、ChromeはSafariを含む）
    if (ua.indexOf('Edg') !== -1) browser = 'Edge';
    else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';

    return browser;
};

/**
 * Collect all system information for bug report
 */
export interface SystemInfo {
    appVersion: string;
    osInfo: string;
    resolution: string;
    browser: string;
    userAgent: string;
    timestamp: string;
}

export const collectSystemInfo = (): SystemInfo => {
    return {
        appVersion: getAppVersion(),
        osInfo: getOSInfo(),
        resolution: getScreenResolution(),
        browser: getBrowserInfo(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    };
};

/**
 * Open bug report Google Form with pre-filled system information
 * ✅ 実際のGoogleフォームに接続されています
 */
export const openBugReportForm = (): void => {
    const info = collectSystemInfo();

    // Google Form URL - 実際のフォームID
    const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdEEHhTG4cD0G4X5BoOKCgfSRUFYSMA72B9xdnIQnSmpJ4piA/viewform';

    // Build pre-fill parameters
    const params = new URLSearchParams();
    params.append('usp', 'pp_url'); // GoogleフォームのURL事前入力モード
    params.append('entry.648029859', `v${info.appVersion}`); // アプリバージョン
    // システム情報に生のUserAgentも追加（デバッグに有用）
    params.append('entry.443486826', `${info.osInfo} | ${info.browser} [UA: ${info.userAgent}]`);
    params.append('entry.1160199469', info.resolution); // 画面解像度（Retina対応）
    // entry.1283294326 はバグ内容フィールド（ユーザーが入力）

    const finalUrl = `${baseUrl}?${params.toString()}`;

    // デバッグ用: コンソールにURLとシステム情報を出力
    console.log('🐛 Bug Report URL:', finalUrl);
    console.log('📊 System Info:', {
        'App Version': info.appVersion,
        'OS': info.osInfo,
        'Browser': info.browser,
        'Resolution': info.resolution,
        'Pixel Ratio': window.devicePixelRatio,
        'User Agent': info.userAgent
    });

    // Open in new tab
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
};
