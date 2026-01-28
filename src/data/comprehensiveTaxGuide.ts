/**
 * 音響機材・耐用年数ガイドブック（完全版）
 * 日本の税法に基づく減価償却資産の耐用年数リスト
 * 
 * 参考法令：
 * - 減価償却資産の耐用年数等に関する省令（昭和40年大蔵省令第15号）
 * - 別表第一「機械及び装置以外の有形減価償却資産の耐用年数表」
 */

export interface TaxGuideEntry {
    category: string;
    subCategory: string;
    examples: string;
    usefulLife: number;
    note: string;
}

export const comprehensiveTaxGuide: TaxGuideEntry[] = [
    // ========================================
    // 1. デジタルミキサー (5年)
    // ========================================
    {
        category: "デジタルミキサー",
        subCategory: "Large Format",
        examples: "DiGiCo Quantum 338, DiGiCo SD7, DiGiCo SD5",
        usefulLife: 5,
        note: "音響機器として5年。ハイエンドコンソール。"
    },
    {
        category: "デジタルミキサー",
        subCategory: "Large Format",
        examples: "Avid VENUE S6L-32D, Avid VENUE S6L-24D",
        usefulLife: 5,
        note: "音響機器として5年。ライブ・レコーディング両用。"
    },
    {
        category: "デジタルミキサー",
        subCategory: "Large Format",
        examples: "Yamaha RIVAGE PM10, Yamaha RIVAGE PM7, Yamaha RIVAGE PM5",
        usefulLife: 5,
        note: "音響機器として5年。大規模ツアー向け。"
    },
    {
        category: "デジタルミキサー",
        subCategory: "Medium Format",
        examples: "Yamaha CL5, Yamaha CL3, Yamaha CL1",
        usefulLife: 5,
        note: "音響機器として5年。中規模会場向け。"
    },
    {
        category: "デジタルミキサー",
        subCategory: "Medium Format",
        examples: "Yamaha QL5, Yamaha QL1, Yamaha DM7",
        usefulLife: 5,
        note: "音響機器として5年。コンパクトモデル。"
    },
    {
        category: "デジタルミキサー",
        subCategory: "Compact",
        examples: "Allen & Heath dLive S7000, Allen & Heath Avantis",
        usefulLife: 5,
        note: "音響機器として5年。モジュラーI/O対応。"
    },
    {
        category: "デジタルミキサー",
        subCategory: "Compact",
        examples: "Behringer X32, Behringer Wing, Midas M32",
        usefulLife: 5,
        note: "音響機器として5年。コストパフォーマンスモデル。"
    },
    {
        category: "デジタルミキサー",
        subCategory: "Compact",
        examples: "Soundcraft Ui24R, Soundcraft Si Impact",
        usefulLife: 5,
        note: "音響機器として5年。小規模会場・リハーサル向け。"
    },

    // ========================================
    // 2. スピーカーシステム (5年)
    // ========================================
    {
        category: "スピーカーシステム",
        subCategory: "Line Array - Large",
        examples: "L-Acoustics K1, L-Acoustics K2, L-Acoustics K1-SB",
        usefulLife: 5,
        note: "音響機器として5年。大規模アリーナ・スタジアム向け。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Line Array - Large",
        examples: "d&b audiotechnik GSL8, d&b KSL8, d&b J-Series",
        usefulLife: 5,
        note: "音響機器として5年。ツアーグレード。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Line Array - Large",
        examples: "Meyer Sound Panther, Meyer Sound Leo, Meyer Sound Lyon",
        usefulLife: 5,
        note: "音響機器として5年。高出力システム。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Line Array - Large",
        examples: "JBL VTX A12, JBL VTX V25, JBL VTX V20",
        usefulLife: 5,
        note: "音響機器として5年。大規模ツアー・固定設備向け。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Line Array - Medium",
        examples: "L-Acoustics Kara, L-Acoustics Kara II, L-Acoustics SB18",
        usefulLife: 5,
        note: "音響機器として5年。中規模会場向け。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Line Array - Medium",
        examples: "d&b audiotechnik V-Series, d&b Y-Series, d&b T-Series",
        usefulLife: 5,
        note: "音響機器として5年。多目的ホール・劇場向け。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Line Array - Compact",
        examples: "L-Acoustics A15, L-Acoustics X8, L-Acoustics X12",
        usefulLife: 5,
        note: "音響機器として5年。小規模会場・固定設備向け。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Point Source",
        examples: "NEXO PS15, NEXO PS10, NEXO GEO S12",
        usefulLife: 5,
        note: "音響機器として5年。ポイントソース・フィル用。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Point Source",
        examples: "Martin Audio CDD15, Martin Audio WPM, Electro-Voice ETX",
        usefulLife: 5,
        note: "音響機器として5年。汎用スピーカー。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Subwoofer",
        examples: "L-Acoustics KS28, d&b B22-SUB, Meyer Sound 1100-LFC",
        usefulLife: 5,
        note: "音響機器として5年。低域補強用。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "Monitor Wedge",
        examples: "L-Acoustics 115XT HiQ, d&b M4, Meyer Sound MJF-212A",
        usefulLife: 5,
        note: "音響機器として5年。ステージモニター。"
    },
    {
        category: "スピーカーシステム",
        subCategory: "IEM System",
        examples: "Shure PSM1000, Sennheiser EW IEM G4, Lectrosonics M2R",
        usefulLife: 5,
        note: "音響機器として5年。インイヤーモニター送信機。"
    },

    // ========================================
    // 3. パワーアンプ・プロセッサ (5年)
    // ========================================
    {
        category: "パワーアンプ",
        subCategory: "High Power",
        examples: "Lab.gruppen PLM 20000Q, Lab.gruppen FP14000",
        usefulLife: 5,
        note: "音響機器として5年。DSP内蔵大出力アンプ。"
    },
    {
        category: "パワーアンプ",
        subCategory: "High Power",
        examples: "Powersoft X8, Powersoft K3, Powersoft M-Force",
        usefulLife: 5,
        note: "音響機器として5年。ツーリング・固定設備向け。"
    },
    {
        category: "パワーアンプ",
        subCategory: "Medium Power",
        examples: "Crown I-Tech 12000HD, Crown VRack 12000HD",
        usefulLife: 5,
        note: "音響機器として5年。中規模会場向け。"
    },
    {
        category: "パワーアンプ",
        subCategory: "Compact",
        examples: "QSC PLD4.5, QSC CXD4.2, QSC GXD8",
        usefulLife: 5,
        note: "音響機器として5年。小規模会場・リハーサル向け。"
    },
    {
        category: "システムプロセッサ",
        subCategory: "Digital Audio Processor",
        examples: "Lake LM44, Lake LM26, Galileo Galaxy 816",
        usefulLife: 5,
        note: "音響機器として5年。スピーカーマネジメント。"
    },
    {
        category: "システムプロセッサ",
        subCategory: "Digital Audio Processor",
        examples: "BSS Soundweb London, dbx DriveRack 4800, Yamaha DME7",
        usefulLife: 5,
        note: "音響機器として5年。会場プロセッシング。"
    },

    // ========================================
    // 4. マイクロフォン・DI (5年 / 消耗品)
    // ========================================
    {
        category: "ワイヤレスマイク",
        subCategory: "Digital Wireless - High End",
        examples: "Shure Axient Digital AD4D, Shure Axient AD2",
        usefulLife: 5,
        note: "音響機器として5年。デジタルワイヤレス最上位。"
    },
    {
        category: "ワイヤレスマイク",
        subCategory: "Digital Wireless - High End",
        examples: "Sennheiser Digital 6000, Sennheiser Digital 9000",
        usefulLife: 5,
        note: "音響機器として5年。長距離伝送対応。"
    },
    {
        category: "ワイヤレスマイク",
        subCategory: "Digital Wireless - Standard",
        examples: "Shure ULX-D Digital, Shure QLXD",
        usefulLife: 5,
        note: "音響機器として5年。標準デジタルシステム。"
    },
    {
        category: "ワイヤレスマイク",
        subCategory: "Analog Wireless",
        examples: "Shure UR4D, Sennheiser EW G4, Audio-Technica 5000 Series",
        usefulLife: 5,
        note: "音響機器として5年。アナログワイヤレス。"
    },
    {
        category: "有線マイクロフォン",
        subCategory: "Dynamic Mic",
        examples: "Shure SM58, Shure SM57, Shure Beta 58A",
        usefulLife: 5,
        note: "10万円未満の場合、少額減価償却資産として即時償却可能。ダイナミックマイク。"
    },
    {
        category: "有線マイクロフォン",
        subCategory: "Condenser Mic",
        examples: "Neumann U87Ai, AKG C414 XLII, Shure KSM32",
        usefulLife: 5,
        note: "10万円未満の場合、少額減価償却資産として即時償却可能。コンデンサーマイク。"
    },
    {
        category: "有線マイクロフォン",
        subCategory: "Measurement Mic",
        examples: "Earthworks M30, Beyerdynamic MM1, DPA 4006A",
        usefulLife: 5,
        note: "音響機器として5年。計測用マイク。"
    },
    {
        category: "DI・プリアンプ",
        subCategory: "Active DI",
        examples: "Radial JDI, Radial J48, BSS AR-133",
        usefulLife: 5,
        note: "10万円未満の場合、少額減価償却資産として即時償却可能。"
    },
    {
        category: "DI・プリアンプ",
        subCategory: "Mic Preamp",
        examples: "Grace Design m108, Millennia HV-3D, Neve 1073",
        usefulLife: 5,
        note: "音響機器として5年。高品質マイクプリ。"
    },

    // ========================================
    // 5. PC・制御機器 (4年) ※要注意
    // ========================================
    {
        category: "PC・ワークステーション",
        subCategory: "Mac",
        examples: "Mac Studio (M2 Ultra), MacBook Pro 16inch M3 Max",
        usefulLife: 4,
        note: "サーバー用途以外のPCは4年。音響用途でも原則PC扱い。"
    },
    {
        category: "PC・ワークステーション",
        subCategory: "Mac",
        examples: "Mac mini M2 Pro, iMac 27inch, MacBook Air M2",
        usefulLife: 4,
        note: "サーバー用途以外のPCは4年。DAW・制御用。"
    },
    {
        category: "PC・ワークステーション",
        subCategory: "Windows",
        examples: "Dell Precision 7920, HP Z8 G4, Lenovo ThinkStation P920",
        usefulLife: 4,
        note: "サーバー用途以外のPCは4年。DAWワークステーション。"
    },
    {
        category: "PC・ワークステーション",
        subCategory: "Laptop",
        examples: "Surface Laptop Studio, ASUS ProArt StudioBook",
        usefulLife: 4,
        note: "サーバー用途以外のPCは4年。モバイルDAW。"
    },
    {
        category: "タブレット・制御端末",
        subCategory: "iPad",
        examples: "iPad Pro 12.9inch, iPad Pro 11inch, iPad Air",
        usefulLife: 4,
        note: "音響調整用でもPC周辺機器として4年が一般的。"
    },
    {
        category: "タブレット・制御端末",
        subCategory: "Android/Windows",
        examples: "Surface Pro 9, Samsung Galaxy Tab S9",
        usefulLife: 4,
        note: "PC周辺機器として4年。制御用タブレット。"
    },

    // ========================================
    // 6. サーバー・ネットワーク機器 (5年 or 4年)
    // ========================================
    {
        category: "オーディオサーバー",
        subCategory: "Dedicated Audio Server",
        examples: "Waves SoundGrid Server One, DiGiCo SD-Rack, Yamaha Rio3224-D2",
        usefulLife: 5,
        note: "専用音響機器として5年が一般的。I/Oラック含む。"
    },
    {
        category: "オーディオサーバー",
        subCategory: "Network Audio Interface",
        examples: "MOTU AVB Switch, Focusrite RedNet D64R, Ferrofish A32pro",
        usefulLife: 5,
        note: "音響機器として5年。Dante/AVB/MADI対応。"
    },
    {
        category: "ネットワーク機器",
        subCategory: "Audio Network Switch",
        examples: "Cisco Catalyst 9300, NETGEAR M4250, Luminex GigaCore",
        usefulLife: 4,
        note: "通信機器は10年だが、PC周辺として4年の解釈も。安全側に4-5年。"
    },
    {
        category: "ストレージ",
        subCategory: "NAS",
        examples: "Synology RS4021xs+, QNAP TVS-h1688X, Drobo B810n",
        usefulLife: 5,
        note: "サーバー用途なら5年。PC周辺なら4年。音響データ保管用は5年が妥当。"
    },

    // ========================================
    // 7. 家具・什器 (8年 / 15年) ※要注意
    // ========================================
    {
        category: "ラック・什器",
        subCategory: "Metal Rack",
        examples: "Middle Atlantic 42U Rack, SKB 20U Shock Rack, Gator GR-12L",
        usefulLife: 15,
        note: "金属製什器は15年。19インチラック、フライトケース等。"
    },
    {
        category: "ラック・什器",
        subCategory: "Steel Shelf",
        examples: "エレクター メタルラック H2448, トラスコ中山 軽量棚",
        usefulLife: 15,
        note: "金属製什器は15年。機材保管用スチール棚。"
    },
    {
        category: "デスク・テーブル",
        subCategory: "Studio Desk - Wood",
        examples: "ヤマハ スタジオデスク (木製), Sound Construction デスク",
        usefulLife: 8,
        note: "木製家具は8年。スタジオデスク・調整卓。"
    },
    {
        category: "デスク・テーブル",
        subCategory: "Studio Desk - Metal",
        examples: "Argosy Console (金属フレーム), Ultimate Support NUC-PT",
        usefulLife: 15,
        note: "金属製家具は15年。金属フレームデスク。"
    },
    {
        category: "椅子・チェア",
        subCategory: "Office Chair",
        examples: "Herman Miller Aeron, Steelcase Leap, オカムラ コンテッサ",
        usefulLife: 8,
        note: "接客業用以外の椅子は8年。スタジオ・事務用。"
    },

    // ========================================
    // 8. ケーブル・スタンド (消耗品 or 5年)
    // ========================================
    {
        category: "ケーブル",
        subCategory: "Audio Cable",
        examples: "Canare L-4E6S XLR, Belden 1192A, Mogami 2534",
        usefulLife: 5,
        note: "通常は消耗品。システム一式導入時は資産に含まれ5年。"
    },
    {
        category: "ケーブル",
        subCategory: "Digital Cable",
        examples: "Canare L-5CFW (BNC), Belden 1694A (SDI), Neutrik etherCON",
        usefulLife: 5,
        note: "通常は消耗品。高額システム導入時は5年。"
    },
    {
        category: "ケーブル",
        subCategory: "Speaker Cable",
        examples: "Canare 4S11, Belden 9497, Speakon-Speakon Cable",
        usefulLife: 5,
        note: "通常は消耗品。固定設備施工時は資産計上し5年。"
    },
    {
        category: "スタンド・ハードウェア",
        subCategory: "Mic Stand",
        examples: "K&M 21021B (Boom Stand), K&M 259 (Low Profile)",
        usefulLife: 5,
        note: "通常は消耗品。大量購入時は資産計上し5年も可。"
    },
    {
        category: "スタンド・ハードウェア",
        subCategory: "Speaker Stand",
        examples: "K&M 21460 (Air Lift), Ultimate Support TS-110B",
        usefulLife: 5,
        note: "通常は消耗品。システム一式導入時は5年。"
    },

    // ========================================
    // 9. レコーディング機器 (5年)
    // ========================================
    {
        category: "オーディオインターフェース",
        subCategory: "High-End Interface",
        examples: "Universal Audio Apollo x16, Apogee Symphony I/O Mk II",
        usefulLife: 5,
        note: "音響機器として5年。プロフェッショナル用途。"
    },
    {
        category: "オーディオインターフェース",
        subCategory: "Standard Interface",
        examples: "Focusrite Scarlett 18i20, MOTU 828es, RME Fireface UCX II",
        usefulLife: 5,
        note: "音響機器として5年。スタジオ・ライブ兼用。"
    },
    {
        category: "マスタークロック",
        subCategory: "Word Clock Generator",
        examples: "Antelope Audio 10MX, Mutec REF10, Apogee Big Ben",
        usefulLife: 5,
        note: "音響機器として5年。クロック同期用。"
    },
    {
        category: "コンバーター",
        subCategory: "AD/DA Converter",
        examples: "Prism Sound ADA-8XR, Lynx Aurora(n), RME ADI-2 Pro FS R",
        usefulLife: 5,
        note: "音響機器として5年。高品質変換。"
    },

    // ========================================
    // 10. モニタースピーカー・アンプ (5年)
    // ========================================
    {
        category: "モニタースピーカー",
        subCategory: "Large Format",
        examples: "Genelec 8361A (The Ones), Neumann KH 420, ADAM Audio S5V",
        usefulLife: 5,
        note: "音響機器として5年。スタジオメインモニター。"
    },
    {
        category: "モニタースピーカー",
        subCategory: "Midfield",
        examples: "Genelec 8351B, Focal Solo6 Be, Yamaha NS-10M Studio",
        usefulLife: 5,
        note: "音響機器として5年。ミッドフィールド。"
    },
    {
        category: "モニタースピーカー",
        subCategory: "Nearfield",
        examples: "Genelec 8030C, KRK Rokit RP7 G4, JBL 305P MkII",
        usefulLife: 5,
        note: "音響機器として5年。ニアフィールド。"
    },
    {
        category: "ヘッドフォン・モニター",
        subCategory: "Studio Headphone",
        examples: "Sony MDR-M1ST, Sennheiser HD 650, Beyerdynamic DT 1990 Pro",
        usefulLife: 5,
        note: "10万円未満の場合、少額減価償却資産として即時償却可能。"
    },

    // ========================================
    // 11. エフェクター・アウトボード (5年)
    // ========================================
    {
        category: "エフェクター",
        subCategory: "Reverb/Delay",
        examples: "Lexicon PCM96, Bricasti M7, Eventide H9000",
        usefulLife: 5,
        note: "音響機器として5年。ハイエンドエフェクター。"
    },
    {
        category: "エフェクター",
        subCategory: "Compressor/Limiter",
        examples: "Empirical Labs Distressor, Universal Audio 1176LN, SSL G-Master Bus",
        usefulLife: 5,
        note: "音響機器として5年。アウトボードダイナミクス。"
    },
    {
        category: "エフェクター",
        subCategory: "EQ",
        examples: "Manley Massive Passive, API 5500, Neve 33609",
        usefulLife: 5,
        note: "音響機器として5年。アウトボードEQ。"
    },

    // ========================================
    // 12. 照明・映像機器 (6年 or 5年)
    // ========================================
    {
        category: "照明機器",
        subCategory: "Moving Light",
        examples: "Robe BMFL Spot, Martin MAC Viper, Ayrton Mistral-TC",
        usefulLife: 6,
        note: "照明設備は6年。ムービングライト。"
    },
    {
        category: "照明機器",
        subCategory: "LED Par/Wash",
        examples: "Elation SEVEN Batten 72, Chauvet Ovation E-910FC",
        usefulLife: 6,
        note: "照明設備は6年。LED照明。"
    },
    {
        category: "映像機器",
        subCategory: "Projector",
        examples: "Panasonic PT-RQ50K (Laser 4K), Barco UDX-4K40",
        usefulLife: 5,
        note: "映像機器として5年。業務用プロジェクター。"
    },
    {
        category: "映像機器",
        subCategory: "Video Switcher",
        examples: "Blackmagic ATEM 4 M/E Constellation 4K, Roland V-800HD MkII",
        usefulLife: 5,
        note: "映像機器として5年。ビデオスイッチャー。"
    },
    {
        category: "映像機器",
        subCategory: "Camera",
        examples: "Sony PXW-Z750, Panasonic AW-UE160, Blackmagic Studio Camera 4K Pro",
        usefulLife: 5,
        note: "映像機器として5年。業務用カメラ。"
    },

    // ========================================
    // 13. 車両・運搬機器 (4年 or 6年)
    // ========================================
    {
        category: "車両",
        subCategory: "Truck (Cargo)",
        examples: "いすゞ エルフ (機材車), トヨタ ハイエース (バン)",
        usefulLife: 4,
        note: "貨物自動車（積載量2t以下）は4年。機材運搬車。"
    },
    {
        category: "車両",
        subCategory: "Truck (Large Cargo)",
        examples: "日野 レンジャー (中型), UDトラックス クオン (大型)",
        usefulLife: 5,
        note: "貨物自動車（積載量2t超）は5年。ツアートラック。"
    },
    {
        category: "車両",
        subCategory: "Passenger Vehicle",
        examples: "トヨタ アルファード, 日産 エルグランド (スタッフ送迎用)",
        usefulLife: 6,
        note: "一般乗用車は6年。スタッフ・アーティスト送迎用。"
    },
];
