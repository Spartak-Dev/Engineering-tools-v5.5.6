// ============================================================================
// formulas.js — Чиста логіка для Engineering Tools 5.5
// Тут живуть тільки формули та константи. Ніякого DOM, ніяких getElementById.
// ============================================================================

// ============================================================================
// 1. КОНСТАНТИ
// ============================================================================

const NOMINAL_VOLTAGE = {
    LI_ION:    3.7,
    LIFEPO4:   3.2,
    LEAD_ACID: 12
};

const EFFICIENCY = {
    CHARGE_LI_ION:      0.85,
    CHARGE_LIFEPO4:     0.95,
    CHARGE_LEAD_ACID:   0.70,
    DISCHARGE_LI_ION:   0.85,
    SYSTEM_LIFEPO4:     0.90,
    SYSTEM_LEAD_ACID:   0.80,
    SOLAR_SYSTEM:       0.75,
    FLASHLIGHT_DRIVER: 0.85
};

const CCCV_FACTORS = {
    NORMAL:     1.0,
    ABOVE_80:   0.7,
    ABOVE_90:   0.35,
    CV_PENALTY: 1.5
};

const LI_ION_CHARGE_PENALTY = 1.3; // емпіричний множник для кнопки 2

// ============================================================================
// 2. КОНВЕРТАЦІЯ ЄМНОСТІ
// ============================================================================

/**
 * mAh → Wh (для Li-ion за замовчуванням)
 */
function mahToWh(mah, voltage = NOMINAL_VOLTAGE.LI_ION) {
    return (Number(mah) / 1000) * voltage;
}

/**
 * Ah → Wh
 */
function ahToWh(ah, voltage) {
    return Number(ah) * voltage;
}

/**
 * УНІВЕРСАЛЬНА функція — отримати ємність у Wh з будь-яких вхідних даних.
 * Використовується у кнопках 4, 7, 8, 9, 10.
 *
 * @param {Object} opts
 * @param {string} opts.type    - 'lithium' | 'lifepo4' | 'lead_acid'
 * @param {string} opts.unit    - 'mah' | 'ah' | 'wh'
 * @param {number} opts.value   - числове значення
 * @param {number} [opts.voltage] - потрібне для 'ah'
 * @returns {number} ємність у Wh
 */
function getCapacityWh({ type = 'lithium', unit = 'mah', value = 0, voltage = null }) {
    const v = Number(value);

    // Якщо вже Wh — просто повертаємо
    if (unit === 'wh') return v;

    // LiFePO4
    if (type === 'lifepo4') {
        if (unit === 'ah') return ahToWh(v, voltage || 12.8);
        if (unit === 'mah') return (v / 1000) * NOMINAL_VOLTAGE.LIFEPO4;
    }

    // Свинцевий
    if (type === 'lead_acid') {
        if (unit === 'ah') {
            if (!voltage || voltage <= 0) return NaN; // сигнал помилки
            return ahToWh(v, voltage);
        }
        if (unit === 'mah') return (v / 1000) * NOMINAL_VOLTAGE.LEAD_ACID;
    }

    // Li-ion (за замовчуванням)
    if (unit === 'ah') return ahToWh(v, NOMINAL_VOLTAGE.LI_ION);
    return mahToWh(v);
}

// ============================================================================
// 3. ККД АКУМУЛЯТОРІВ
// ============================================================================

function getChargeEfficiency(type) {
    if (type === 'lifepo4')   return EFFICIENCY.CHARGE_LIFEPO4;
    if (type === 'lead_acid') return EFFICIENCY.CHARGE_LEAD_ACID;
    return EFFICIENCY.CHARGE_LI_ION;
}

function getDischargeEfficiency(type) {
    if (type === 'lifepo4')   return EFFICIENCY.SYSTEM_LIFEPO4;
    if (type === 'lead_acid') return EFFICIENCY.SYSTEM_LEAD_ACID;
    return EFFICIENCY.DISCHARGE_LI_ION;
}

function getSystemEfficiency(type) {
    // Використовується у Home Backup
    if (type === 'lifepo4') return EFFICIENCY.SYSTEM_LIFEPO4;
    return EFFICIENCY.SYSTEM_LEAD_ACID;
}

// ============================================================================
// 4. ЧАСОВІ РОЗРАХУНКИ
// ============================================================================

/**
 * Коефіцієнт ККД залежно від поточного % заряду (для циклу зарядки ПБ)
 * Логіка: після 80% і після 90% — ККД падає.
 */
function getCCCVFactor(percent) {
    if (percent >= 90) return CCCV_FACTORS.ABOVE_90;
    if (percent >= 80) return CCCV_FACTORS.ABOVE_80;
    return CCCV_FACTORS.NORMAL;
}

/**
 * Простий час: wh / потужність (у хвилинах)
 */
function calculateSimpleTime(wh, watts) {
    if (!watts || watts <= 0) return 0;
    return (wh / watts) * 60;
}

/**
 * Кнопка 1 — Час зарядки ПБ (Динаміка) з урахуванням падіння ККД.
 * @param {number} wh           — енергія ПБ у Wh
 * @param {number} watts        — потужність зарядки у W
 * @param {number} startPercent — поточний % заряду
 * @returns {number} час у хвилинах
 */
function calculatePowerbankChargeTime(wh, watts, startPercent) {
    let totalMinutes = 0;
    for (let i = startPercent; i < 100; i++) {
        let eff = watts * EFFICIENCY.CHARGE_LI_ION;
        if (i >= 80 && i < 90) eff *= CCCV_FACTORS.ABOVE_80;
        if (i >= 90) eff *= CCCV_FACTORS.ABOVE_90;
        totalMinutes += ((wh / 100) / eff) * 60;
    }
    return totalMinutes;
}

/**
 * Кнопка 2 — Час зарядки Li-ion акумулятора
 */
function calculateLiIonChargeTime(wh, U, A) {
    const baseMins = (wh / (U * A * EFFICIENCY.CHARGE_LI_ION)) * 60;
    return baseMins * LI_ION_CHARGE_PENALTY;
}

/**
 * Кнопка 4 — Скільки було світло (через різницю %)
 */
function calculateLightTime(capacityWh, percentStart, percentEnd, watts) {
    const deltaPercent = Math.abs(percentEnd - percentStart) / 100;
    return ((capacityWh * deltaPercent) / (watts * EFFICIENCY.DISCHARGE_LI_ION)) * 60;
}

/**
 * Кнопка 6 — Час роботи ліхтарика
 * @param {number} whFull       — повна енергія акумулятора у Wh
 * @param {number} percent      — поточний % заряду
 * @param {number} lumens       — яскравість у люменах
 */
function calculateFlashlightTime(whFull, percent, lumens) {
    const wh = whFull * (percent / 100);
    return (wh / (lumens / 100)) * 60;
}
/**
 * Допоміжна: лм/Вт для конкретного чіпа.
 * @param {object} chip — об'єкт чіпа з LED_CHIPS { maxLumens, maxWatts }
 * @returns {number} ефективність у лм/Вт
 */
function getChipLumensPerWatt(chip) {
    return chip.maxLumens / chip.maxWatts;
}
/**
 * Час роботи ліхтарика за характеристиками чіпа.
 * @param {number} whFull       — повна енергія акумулятора у Wh
 * @param {number} percent      — поточний % заряду (0–100)
 * @param {number} userLumens   — бажана яскравість у lm
 * @param {object} chip         — об'єкт чіпа з LED_CHIPS
 * @param {number} driverEff    — ККД драйвера (0–1)
 * @returns {number} час у хвилинах
 */
function calculateFlashlightTimeFromChip(whFull, percent, userLumens, chip, driverEff) {
    const wh = whFull * (percent / 100);
    const ratio = getChipLumensPerWatt(chip);
    const powerDraw = userLumens / ratio;
    return (wh * driverEff / powerDraw) * 60;
}

/**
 * Час роботи ліхтарика за введеною потужністю (ручний режим).
 * @param {number} whFull     — повна енергія у Wh
 * @param {number} percent    — поточний % заряду (0–100)
 * @param {number} watts      — реальне споживання у W
 * @param {number} driverEff  — ККД драйвера (0–1)
 * @returns {number} час у хвилинах
 */
function calculateFlashlightTimeFromWatts(whFull, percent, watts, driverEff) {
    const wh = whFull * (percent / 100);
    return (wh * driverEff / watts) * 60;
}

/**
 * Кнопка 7 — Режим виживання (максимальна потужність на N годин)
 */
function calculateSurvivalMaxPower(capacityWh, percent, hours) {
    const availableWh = capacityWh * (percent / 100) * EFFICIENCY.DISCHARGE_LI_ION;
    if (!hours || hours <= 0) return { availableWh, maxW: 0 };
    return { availableWh, maxW: availableWh / hours };
}

/**
 * Кнопка 9 — Home Backup: час роботи
 */
function calculateHomeBackupTime(capacityWh, totalW, type) {
    const efficiency = getSystemEfficiency(type);
    const usableWh = capacityWh * efficiency;
    if (!totalW || totalW <= 0) return { usableWh, hours: 0 };
    return { usableWh, hours: usableWh / totalW };
}

/**
 * Кнопка 10 — Регенерація: час зарядки великих АКБ
 */
function calculateRechargeTime(capacityWh, currentPercent, chargePower, type) {
    if (currentPercent >= 100) return { neededWh: 0, effectivePower: 0, hours: 0 };

    const neededWh = capacityWh * ((100 - currentPercent) / 100);
    const efficiency = getChargeEfficiency(type);
    const effectivePower = chargePower * efficiency;
    const hours = effectivePower > 0 ? neededWh / effectivePower : 0;

    return { neededWh, effectivePower, hours };
}

// ============================================================================
// 5. АУДИТ ЯКОСТІ ПБ (кнопка 8)
// ============================================================================

function calculateAuditEfficiency(nominalWh, percentUsed, realWh) {
    const expectedWh = nominalWh * (percentUsed / 100);
    if (!expectedWh) return 0;
    return (realWh / expectedWh) * 100;
}

function calculateRealCapacity(realWh, percentUsed) {
    if (!percentUsed) return 0;
    return realWh / (percentUsed / 100);
}

function calculateRealCapacityMah(realCapacityWh, type = 'lithium') {
    const v = (type === 'lifepo4') ? NOMINAL_VOLTAGE.LIFEPO4 : NOMINAL_VOLTAGE.LI_ION;
    return (realCapacityWh / v) * 1000;
}

function getQualityStatus(efficiency) {
    if (efficiency < 70) return { icon: '⚠️', text: 'Низька якість!' };
    if (efficiency < 85) return { icon: '⚡', text: 'Середня якість' };
    return { icon: '✅', text: 'Хороша якість' };
}

// ============================================================================
// 6. СОНЯЧНА ГЕОМЕТРІЯ (для кнопки 11)
// ============================================================================

const SEASONAL_COEFFICIENTS = {
    '12': 0.25, '1': 0.25, '2': 0.55, '3': 0.55, '4': 0.85, '5': 0.85,
    '6': 1.00, '7': 1.00, '8': 0.80, '9': 0.80, '10': 0.45, '11': 0.45
};

function solarDeclination(dayOfYear) {
    return -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * Math.PI / 180);
}

function solarHourAngle(hour) {
    return (hour - 12) * 15;
}

function solarAltitude(lat, decl, hourAngle) {
    const phi = lat * Math.PI / 180;
    const delta = decl * Math.PI / 180;
    const omega = hourAngle * Math.PI / 180;
    const sinAlpha = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(omega);
    return Math.asin(sinAlpha) * 180 / Math.PI;
}

function solarIrradiance(altitude, tilt, azimuth, seasonCoeff) {
    if (altitude <= 0) return 0;
    const alpha = altitude * Math.PI / 180;
    const beta = tilt * Math.PI / 180;
    const incidenceFactor = Math.sin(alpha) * Math.cos(beta) + Math.cos(alpha) * Math.sin(beta);
    return Math.max(0, 1000 * incidenceFactor) * seasonCoeff;
}

function getSeasonCoefficient(month) {
    return SEASONAL_COEFFICIENTS[String(month)] || 0.75;
}

function getDayOfYear(dateStr) {
    const date = new Date(dateStr);
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

/**
 * Повний офлайн-профіль виробітки сонячної панелі на 24 години.
 * @returns {number[]} масив з 24 значень (по одному на кожну годину)
 */
function calculateSolarOfflineProfile({ lat, tilt, azimuth, date, totalPowerKw }) {
    const dayOfYear = getDayOfYear(date);
    const decl = solarDeclination(dayOfYear);
    const month = new Date(date).getMonth() + 1;
    const seasonCoeff = getSeasonCoefficient(month);
    const profile = [];

    for (let hour = 0; hour < 24; hour++) {
        const omega = solarHourAngle(hour);
        const altitude = solarAltitude(lat, decl, omega);
        const irradiance = solarIrradiance(altitude, tilt, azimuth, seasonCoeff);
        profile.push(Math.round(irradiance * totalPowerKw * EFFICIENCY.SOLAR_SYSTEM));
    }
    return profile;
}
