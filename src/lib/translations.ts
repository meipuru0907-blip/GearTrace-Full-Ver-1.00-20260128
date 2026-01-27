export type Language = 'ja' | 'en';

export const translations = {
    ja: {
        app: {
            title: "GearTrace",
            dashboard: "ダッシュボード",
            addGear: "機材登録",
            settings: "設定",
            logout: "ログアウト"
        },
        dashboard: {
            inventory: "機材一覧",
            searchPlaceholder: "機材を検索...",
            registerNew: "新規登録",
            addGear: "機材登録",
            syncToSheets: "Excelに出力 (.xlsx)",
            syncSuccess: "Excelファイルをダウンロードしました！",
            syncError: "出力に失敗しました。",
            noGearFound: "機材が見つかりません",
            startAdding: "最初の機材を登録しましょう。",
            addButton: "登録する",
            sn: "SN",
            view: {
                grid: "グリッド",
                list: "リスト",
                large: "大"
            }
        },
        addGear: {
            title: "新規機材登録",
            step1: "1. 個体識別 (写真)",
            step1Desc: "機材の特徴的な部分を撮影してください。「特徴点」は同型機を識別するカギとなります。",
            step2: "2. 基本情報",
            uploadHero: "全体写真",
            uploadSerial: "シリアルNo.",
            uploadFeature: "特徴点/傷",
            visualTag: "カラータグ (識別用テープ)",
            next: "次へ",
            back: "戻る",
            save: "保存",
            manufacturer: "メーカー",
            model: "モデル名",
            category: "カテゴリー",
            serialNumber: "シリアルナンバー",
            purchaseDate: "購入日",
            price: "購入価格 (円)",
            lifespan: "耐用年数 (年)",
            financials: "財務・ステータス",
            required: "必須",
            toastSuccess: "機材を登録しました！",
            toastError: "保存に失敗しました。",
            toastPhotoRequired: "全体写真は必須です。",
            uploadPlaceholder: "アップロード",
            changePhoto: "写真を変更",
            visualTagDesc: "識別用テープなどで同型機を区別する場合に使用します。",
            visualTagOff: "なし"
        },
        detail: {
            assetDetails: "資産詳細",
            history: "履歴・ログ",
            noLogs: "ログはまだありません。",
            bookValue: "現在簿価 (推定)",
            straightLine: "定額法償却",
            originalCost: "取得価額",
            depreciationYear: "減価償却費/年",
            fullyDepreciated: "※ 償却完了 (1円備忘価額)",
            loading: "読み込み中..."
        },
        status: {
            Available: "稼働中",
            InUse: "使用中",
            Maintenance: "メンテナンス中",
            Repair: "修理中",
            Broken: "故障",
            Missing: "紛失",
            Sold: "売却済"
        },
        common: {
            step: "ステップ",
            of: "/",
            years: "年"
        }
    }
};
