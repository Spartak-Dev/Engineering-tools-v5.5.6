// ============================================================================
// data_base.js — База даних пресетів для Engineering Tools 5.5
// Тут зберігаються реальні характеристики пристроїв.
// Файл не містить логіки — тільки дані.
// ============================================================================

// ============================================================================
// 1. СВІТЛОДІОДНІ ЧІПИ (для кнопки 6 — Робота ліхтарика)
// ============================================================================

const LED_CHIP_CATEGORIES = [
    { id: 'thrower',  label: '🎯 Дальнобійні (Thrower)' },
    { id: 'flooder',  label: '💡 Заливного світла (Flooder)' },
    { id: 'highCri',  label: '🎨 Висока якість кольору (High CRI)' },
    { id: 'budget',   label: '💰 Бюджетний сегмент' }
];

const LED_CHIPS = {
    thrower: [
        { id: 'sft40',        name: 'Luminus SFT-40',                 maxLumens: 2200, maxWatts: 25 },
        { id: 'cree_cplhi',   name: 'Cree CPLHI (HI / XHP35 Hi)',     maxLumens: 1500, maxWatts: 13 },
        { id: 'sbt902',       name: 'Luminus SBT90.2',                maxLumens: 5500, maxWatts: 60 },
        { id: 'osram_cslnm1', name: 'Osram CSLNM1.TG (1mm²)',         maxLumens: 900,  maxWatts: 15 },
        { id: 'osram_culpm1', name: 'Osram CULPM1.TG (2mm²)',         maxLumens: 1500, maxWatts: 20 },
        { id: 'cree_xpl_hi',  name: 'Cree XP-L HI',                   maxLumens: 1100, maxWatts: 10 },
        { id: 'sanan_sft25r', name: "San'an SFT-25R",                 maxLumens: 1200, maxWatts: 14 },
        { id: 'luminus_nm1',  name: 'Luminus NM1 / PM1',              maxLumens: 1400, maxWatts: 18 }
    ],
    flooder: [
        { id: 'xhp702',       name: 'Cree XHP70.2 / XHP70.3 HD',      maxLumens: 4500, maxWatts: 30 },
        { id: 'xhp502',       name: 'Cree XHP50.2 / XHP50.3 HD',      maxLumens: 2500, maxWatts: 18 },
        { id: 'sst40',        name: 'Luminus SST-40',                 maxLumens: 1800, maxWatts: 15 },
        { id: 'xml2',         name: 'Cree XM-L2',                     maxLumens: 1000, maxWatts: 10 },
        { id: 'nichia_144ar', name: 'Nichia 144AR',                   maxLumens: 1600, maxWatts: 15 },
        { id: 'xhp352',       name: 'Cree XHP35.2 HD',                maxLumens: 2000, maxWatts: 16 },
        { id: 'sst70',        name: 'Luminus SST-70',                 maxLumens: 3500, maxWatts: 28 }
    ],
    highCri: [
        { id: 'nichia_219b',  name: 'Nichia 219B',                    maxLumens: 500,  maxWatts: 6 },
        { id: 'nichia_519a',  name: 'Nichia 519A',                    maxLumens: 1400, maxWatts: 18 },
        { id: 'sst20_cri',    name: 'Luminus SST-20 High CRI (90+)',  maxLumens: 700,  maxWatts: 9 },
        { id: 'nichia_e21a',  name: 'Nichia E21A',                    maxLumens: 350,  maxWatts: 4 },
        { id: 'getian_fc40',  name: 'Getian FC40',                    maxLumens: 2500, maxWatts: 30 },
        { id: 'lh351d',       name: 'Samsung LH351D',                 maxLumens: 1000, maxWatts: 10 },
        { id: 'xhp503_cri',   name: 'Cree XHP50.3 HI High CRI',       maxLumens: 1800, maxWatts: 18 },
        { id: 'bridgelux',    name: 'Bridgelux Thrive',               maxLumens: 600,  maxWatts: 7 }
    ],
    budget: [
        { id: 'xpg2',         name: 'Cree XP-G2',                     maxLumens: 500,  maxWatts: 5 },
        { id: 'sst20_std',    name: 'Luminus SST-20 (6500K)',         maxLumens: 1000, maxWatts: 9 },
        { id: 'osram_p9',     name: 'Osram P9 (GW PUSTM1.PM)',        maxLumens: 1200, maxWatts: 10 },
        { id: 'lattice_hm',   name: 'LatticePower HM / TN',           maxLumens: 800,  maxWatts: 8 },
        { id: 'xpe2',         name: 'Cree XP-E2',                     maxLumens: 300,  maxWatts: 3 },
        { id: 'sanan_sfn43',  name: "San'an SFN43 / SFT40 clones",    maxLumens: 1800, maxWatts: 18 },
        { id: 'wicop',        name: 'Seoul WICOP',                    maxLumens: 400,  maxWatts: 4 }
    ]
};