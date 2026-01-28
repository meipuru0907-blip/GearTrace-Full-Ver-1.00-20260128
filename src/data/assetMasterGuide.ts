/**
 * 資産・耐用年数マスターガイド（完全版）
 * エンタメ業界（音響・照明・映像・運搬）の主要機材を網羅
 * 
 * 日本の税法に基づく耐用年数リスト
 * 参考：減価償却資産の耐用年数等に関する省令
 */

export interface AssetGuideEntry {
    category: string;
    subCategory: string;
    items: string;
    years: number;
    note: string;
}

export const ASSET_MASTER_GUIDE: AssetGuideEntry[] = [
    // ========================================
    // 音響機器（5年）
    // ========================================
    {
        category: "音響機器",
        subCategory: "デジタルミキサー",
        items: "DiGiCo, Avid S6L, Yamaha RIVAGE/CL/QL, A&H dLive/Avantis, Behringer X32/Wing",
        years: 5,
        note: "音響機器として5年が標準"
    },
    {
        category: "音響機器",
        subCategory: "スピーカーシステム",
        items: "L-Acoustics K/Kara, d&b GSL/V/Y, Meyer Sound, JBL VTX, NEXO",
        years: 5,
        note: "ラインアレイ・ポイントソース・サブウーファー含む"
    },
    {
        category: "音響機器",
        subCategory: "パワーアンプ",
        items: "Lab.gruppen PLM, Powersoft X/K, Crown I-Tech, QSC PLD",
        years: 5,
        note: "DSP内蔵アンプ含む"
    },
    {
        category: "音響機器",
        subCategory: "プロセッサ",
        items: "Lake LM, Galileo Galaxy, BSS Soundweb, dbx DriveRack",
        years: 5,
        note: "スピーカーマネジメント・システムプロセッサ"
    },
    {
        category: "音響機器",
        subCategory: "ワイヤレスマイク",
        items: "Shure Axient/ULX-D, Sennheiser Digital 6000/9000, Audio-Technica 5000",
        years: 5,
        note: "デジタル・アナログワイヤレス含む"
    },
    {
        category: "音響機器",
        subCategory: "マイク・DI",
        items: "SM58, U87Ai, C414, Radial DI, BSS AR-133",
        years: 5,
        note: "※10万円未満の場合は少額減価償却資産として即時償却可能"
    },
    {
        category: "音響機器",
        subCategory: "IEMシステム",
        items: "Shure PSM1000, Sennheiser EW IEM G4, Lectrosonics",
        years: 5,
        note: "インイヤーモニター送信機・受信機"
    },
    {
        category: "音響機器",
        subCategory: "オーディオI/F",
        items: "UA Apollo, Apogee Symphony, Focusrite RedNet, RME, MOTU",
        years: 5,
        note: "レコーディング・ライブ用インターフェース"
    },
    {
        category: "音響機器",
        subCategory: "モニタースピーカー",
        items: "Genelec 8000/The Ones, Focal, ADAM Audio, Yamaha NS-10M",
        years: 5,
        note: "スタジオモニター"
    },
    {
        category: "音響機器",
        subCategory: "エフェクター",
        items: "Lexicon PCM96, Bricasti M7, Eventide H9000, Empirical Labs Distressor",
        years: 5,
        note: "リバーブ・コンプ・EQ等のアウトボード"
    },

    // ========================================
    // PC・制御機器（4年）※要注意
    // ========================================
    {
        category: "PC・制御機器",
        subCategory: "Mac",
        items: "Mac Studio, MacBook Pro, Mac mini, iMac",
        years: 4,
        note: "⚠️ 音響用途でもPC扱いで4年が原則"
    },
    {
        category: "PC・制御機器",
        subCategory: "Windows PC",
        items: "Dell Precision, HP Z series, Lenovo ThinkStation, Surface",
        years: 4,
        note: "⚠️ DAWワークステーション含む。4年が原則"
    },
    {
        category: "PC・制御機器",
        subCategory: "タブレット",
        items: "iPad Pro, Surface Pro, Galaxy Tab",
        years: 4,
        note: "⚠️ 音響調整用でもPC周辺機器として4年"
    },

    // ========================================
    // サーバー・ネットワーク（4-5年）
    // ========================================
    {
        category: "サーバー・ネットワーク",
        subCategory: "オーディオサーバー",
        items: "Waves SoundGrid Server, DiGiCo SD-Rack, Yamaha Rio, Focusrite RedNet",
        years: 5,
        note: "専用音響機器として5年が一般的"
    },
    {
        category: "サーバー・ネットワーク",
        subCategory: "ネットワークスイッチ",
        items: "Cisco Catalyst, NETGEAR M4250, Luminex GigaCore",
        years: 4,
        note: "通信機器10年だが、PC周辺として4年の解釈も。安全側に4-5年"
    },
    {
        category: "サーバー・ネットワーク",
        subCategory: "NAS・ストレージ",
        items: "Synology, QNAP, Drobo",
        years: 5,
        note: "音響データ保管用は5年が妥当"
    },

    // ========================================
    // 照明機器（6年）
    // ========================================
    {
        category: "照明機器",
        subCategory: "ムービングライト",
        items: "Robe BMFL, Martin MAC Viper, Ayrton, Clay Paky",
        years: 6,
        note: "照明設備として6年"
    },
    {
        category: "照明機器",
        subCategory: "LED照明",
        items: "Elation SEVEN, Chauvet Ovation, ETC ColorSource",
        years: 6,
        note: "LED Par/Wash/Stripライト含む"
    },
    {
        category: "照明機器",
        subCategory: "調光卓・DMX",
        items: "GrandMA3, Avolites Sapphire, ETC Ion, Chamsys MagicQ",
        years: 6,
        note: "照明コンソール・DMXコントローラー"
    },

    // ========================================
    // 映像機器（5年）
    // ========================================
    {
        category: "映像機器",
        subCategory: "プロジェクター",
        items: "Panasonic PT-RQ/RZ (4K Laser), Barco UDX, Christie Digital",
        years: 5,
        note: "業務用レーザー/ランププロジェクター"
    },
    {
        category: "映像機器",
        subCategory: "ビデオスイッチャー",
        items: "Blackmagic ATEM Constellation, Roland V-800HD, Panasonic AV-HS",
        years: 5,
        note: "ライブスイッチング・配信用"
    },
    {
        category: "映像機器",
        subCategory: "業務用カメラ",
        items: "Sony PXW-Z750, Panasonic AW-UE160, Blackmagic Studio Camera 4K",
        years: 5,
        note: "PTZカメラ・ボックスカメラ含む"
    },
    {
        category: "映像機器",
        subCategory: "LEDビジョン",
        items: "Absen, ROE Visual, Unilumin, INFiLED",
        years: 5,
        note: "屋内外LEDディスプレイパネル"
    },
    {
        category: "映像機器",
        subCategory: "映像プロセッサ",
        items: "Barco E2, Analog Way Aquilon, Dataton WATCHOUT",
        years: 5,
        note: "スケーラー・マルチディスプレイプロセッサ"
    },

    // ========================================
    // 家具・什器（8年 or 15年）※要注意
    // ========================================
    {
        category: "家具・什器",
        subCategory: "金属製ラック",
        items: "Middle Atlantic 42U, SKB Shock Rack, Gator, エレクターラック",
        years: 15,
        note: "⚠️ 金属製什器は15年。19インチラック・スチール棚含む"
    },
    {
        category: "家具・什器",
        subCategory: "木製デスク",
        items: "スタジオデスク(木製), 調整卓",
        years: 8,
        note: "⚠️ 木製家具は8年"
    },
    {
        category: "家具・什器",
        subCategory: "金属製デスク",
        items: "Argosy Console, Ultimate Support (金属フレーム)",
        years: 15,
        note: "⚠️ 金属製家具は15年"
    },
    {
        category: "家具・什器",
        subCategory: "椅子",
        items: "Herman Miller Aeron, Steelcase Leap, オカムラ コンテッサ",
        years: 8,
        note: "接客業用以外の椅子は8年"
    },

    // ========================================
    // ケーブル・スタンド（消耗品 or 5年）
    // ========================================
    {
        category: "ケーブル類",
        subCategory: "オーディオケーブル",
        items: "Canare L-4E6S, Belden 1192A, Mogami 2534",
        years: 5,
        note: "通常は消耗品。システム一式導入時は資産計上し5年"
    },
    {
        category: "ケーブル類",
        subCategory: "スピーカーケーブル",
        items: "Canare 4S11, Belden 9497, Speakon ケーブル",
        years: 5,
        note: "通常は消耗品。固定設備施工時は5年"
    },
    {
        category: "ケーブル類",
        subCategory: "映像ケーブル",
        items: "Canare BNC, Belden SDI, HDMI 2.1, DisplayPort",
        years: 5,
        note: "通常は消耗品。高額システム導入時は5年"
    },
    {
        category: "スタンド類",
        subCategory: "マイクスタンド",
        items: "K&M 21021B (Boom), K&M 259, Ultimate Support",
        years: 5,
        note: "通常は消耗品。大量購入時は資産計上可"
    },
    {
        category: "スタンド類",
        subCategory: "スピーカースタンド",
        items: "K&M 21460 (Air Lift), Ultimate Support TS-110B",
        years: 5,
        note: "通常は消耗品。システム一式導入時は5年"
    },
    {
        category: "スタンド類",
        subCategory: "照明スタンド・トラス",
        items: "Global Truss, PROLYTE, Manfrotto照明スタンド",
        years: 5,
        note: "アルミトラス・スタンド類"
    },

    // ========================================
    // 車両（4年 or 5年 or 6年）※要注意
    // ========================================
    {
        category: "車両",
        subCategory: "小型貨物（2t以下）",
        items: "トヨタ ハイエース (バン), 日産 NV350キャラバン, いすゞ エルフ",
        years: 4,
        note: "⚠️ 貨物自動車（積載量2t以下）は4年。機材運搬車"
    },
    {
        category: "車両",
        subCategory: "中型・大型貨物（2t超）",
        items: "日野 レンジャー, いすゞ フォワード, UDトラックス クオン",
        years: 5,
        note: "⚠️ 貨物自動車（積載量2t超）は5年。ツアートラック"
    },
    {
        category: "車両",
        subCategory: "乗用車",
        items: "トヨタ アルファード, 日産 エルグランド, レクサス LS",
        years: 6,
        note: "⚠️ 一般乗用車は6年。スタッフ・アーティスト送迎用"
    },
    {
        category: "車両",
        subCategory: "特殊車両",
        items: "中継車, 移動スタジオ車, 発電車",
        years: 5,
        note: "特種用途自動車として5年"
    },

    // ========================================
    // その他（機材関連）
    // ========================================
    {
        category: "その他機材",
        subCategory: "発電機",
        items: "ヤマハ発電機, Honda EU, デンヨー",
        years: 5,
        note: "機械装置として5年"
    },
    {
        category: "その他機材",
        subCategory: "UPS・電源機器",
        items: "APC Smart-UPS, OMRON BU, Eaton",
        years: 5,
        note: "無停電電源装置・電源分配器"
    },
    {
        category: "その他機材",
        subCategory: "インカム・トランシーバー",
        items: "Clear-Com, Riedel Bolero, Motorola, KENWOOD",
        years: 5,
        note: "無線通信機器"
    },
    {
        category: "その他機材",
        subCategory: "測定器",
        items: "Smaart, SMAART, AudioTools, SATlive, Earthworks測定マイク",
        years: 5,
        note: "音響測定ソフト・ハードウェア"
    },
];
