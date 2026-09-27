// ============================================================================
// 2. УНІВЕРСАЛЬНІ ФУНКЦІЇ ВІДКРИТТЯ/ЗАКРИТТЯ МОДАЛЬНИХ ВІКОН
// ============================================================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "block";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        const resultDiv = document.getElementById(modalId.replace('Modal', 'Result'));
        if (resultDiv) {
            resultDiv.style.display = "none";
            resultDiv.textContent = "";
        }
    }
}

window.onclick = function(event) {
    const modals = document.getElementsByClassName("modal");
    for (let i = 0; i < modals.length; i++) {
        if (event.target === modals[i]) {
            modals[i].style.display = "none";
            const resultDiv = document.getElementById(modals[i].id.replace('Modal', 'Result'));
            if (resultDiv) {
                resultDiv.style.display = "none";
                resultDiv.textContent = "";
            }
        }
    }
};

// ============================================================================
// 3. ФУНКЦІЇ ДЛЯ КНОПКИ 1 – ЗАРЯДКА ПБ (ДИНАМІКА)
// ============================================================================
function togglePbCapacityFields() {
    const know = document.getElementById('pb_know_capacity').value;
    const label = document.getElementById('pb_mah_label');
    const input = document.getElementById('pb_mah');
    if (know === 'wh') {
        label.textContent = 'Ємність ПБ (Wh):';
        input.placeholder = 'Наприклад: 37';
    } else {
        label.textContent = 'Ємність ПБ (mAh):';
        input.placeholder = 'Наприклад: 10000';
    }
}

function openCalcPowerbankForm() {
    document.getElementById('pb_mah').value = '';
    document.getElementById('pb_watts').value = '';
    document.getElementById('pb_percent').value = '';
    document.getElementById('pb_know_capacity').value = 'mah';
    togglePbCapacityFields();
    openModal('calcPowerbankModal');
}

function calcPowerbank() {
    const know = document.getElementById('pb_know_capacity').value;
    let wh;
    if (know === 'wh') {
        wh = Number(document.getElementById('pb_mah').value);
    } else {
        wh = mahToWh(Number(document.getElementById('pb_mah').value));
    }
    const watts = Number(document.getElementById('pb_watts').value);
    const p = Number(document.getElementById('pb_percent').value);

    const v = validateFields([
        { name: 'Ємність ПБ', value: wh, positive: true },
        { name: 'Потужність зарядки (W)', value: watts, positive: true },
        { name: 'Поточний % заряду', value: p, min: 0, max: 100 }
    ]);
    if (!v.ok) return alert(v.message);

    const totalMinutes = calculatePowerbankChargeTime(wh, watts, p);
    const resultDiv = document.getElementById('calcPowerbankResult');
    resultDiv.textContent = `Час зарядки: ${formatTime(totalMinutes)}`;
    resultDiv.style.display = 'block';
}

// ============================================================================
// 4. ФУНКЦІЇ ДЛЯ КНОПКИ 2 – ЗАРЯДКА LI-ION АКУМУЛЯТОРІВ
// ============================================================================
function toggleLiIonCapacityFields() {
    const know = document.getElementById('liion_know_capacity').value;
    const label = document.getElementById('liion_mah_label');
    const input = document.getElementById('liion_mah');
    if (know === 'wh') {
        label.textContent = 'Ємність акумулятора (Wh):';
        input.placeholder = 'Наприклад: 10';
    } else {
        label.textContent = 'Ємність акумулятора (mAh):';
        input.placeholder = 'Наприклад: 2600';
    }
}

function openCalcLiIonForm() {
    document.getElementById('liion_mah').value = '';
    document.getElementById('liion_watts').value = '';
    document.getElementById('liion_volts').value = '';
    document.getElementById('liion_amps').value = '';
    document.getElementById('know_power').value = 'yes';
    document.getElementById('liion_know_capacity').value = 'mah';
    toggleLiIonCapacityFields();
    togglePowerFields();
    openModal('calcLiIonModal');
}

function togglePowerFields() {
    const know = document.getElementById('know_power').value;
    document.getElementById('power_fields').style.display = (know === 'yes' ? 'block' : 'none');
    document.getElementById('voltage_fields').style.display = (know === 'yes' ? 'none' : 'block');
}

function calcLiIon() {
    const knowCap = document.getElementById('liion_know_capacity').value;
    let E_wh;
    if (knowCap === 'wh') {
        E_wh = Number(document.getElementById('liion_mah').value);
    } else {
        E_wh = mahToWh(Number(document.getElementById('liion_mah').value));
    }
    const knowPower = document.getElementById('know_power').value;
    let U = 5, A = 1;
    if (knowPower === 'yes') {
        A = Number(document.getElementById('liion_watts').value) / 5;
    } else {
        U = Number(document.getElementById('liion_volts').value);
        A = Number(document.getElementById('liion_amps').value);
    }

    const v = validateFields([
        { name: 'Ємність акумулятора', value: E_wh, positive: true },
        { name: 'Напруга (V)', value: U, positive: true },
        { name: 'Струм (A)', value: A, positive: true }
    ]);
    if (!v.ok) return alert(v.message);

    const baseMins = calculateLiIonChargeTime(E_wh, U, A);
    const resultDiv = document.getElementById('calcLiIonResult');
    resultDiv.textContent = `Прогноз: ${formatTime(baseMins)}`;
    resultDiv.style.display = 'block';
}

// ============================================================================
// 5. ФУНКЦІЇ ДЛЯ КНОПКИ 3 – ЧАС РОБОТИ (PRO MODE)
// ============================================================================
function openCalcWorkTimeForm() {
    document.getElementById('know_wh').value = 'yes';
    document.getElementById('worktime_wh').value = '';
    document.getElementById('worktime_mah').value = '';
    document.getElementById('worktime_v').value = '3.7';
    document.getElementById('worktime_maxw').value = '';
    document.getElementById('worktime_count').value = '';
    document.getElementById('consumers_container').innerHTML = '';
    toggleWhFields();
    openModal('calcWorkTimeModal');
}

function toggleWhFields() {
    const know = document.getElementById('know_wh').value;
    document.getElementById('wh_field').style.display = (know === 'yes' ? 'block' : 'none');
    document.getElementById('mah_v_fields').style.display = (know === 'yes' ? 'none' : 'block');
    updateConsumerFields();
}

function updateConsumerFields() {
    const count = document.getElementById('worktime_count').value;
    const container = document.getElementById('consumers_container');
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>Споживач №${i}: Знаєте потужність (W)?</label>
            <select id="consumer_${i}_know" onchange="toggleConsumerFields(${i})">
                <option value="yes">Так</option>
                <option value="no">Ні (V та A)</option>
            </select>
            <div id="consumer_${i}_w_field">
                <label>Потужність (W):</label>
                <input type="number" id="consumer_${i}_w">
            </div>
            <div id="consumer_${i}_va_fields" style="display: none;">
                <label>V:</label> <input type="number" id="consumer_${i}_v">
                <label>A:</label> <input type="number" id="consumer_${i}_a">
            </div>
        `;
        container.appendChild(div);
    }
}

function toggleConsumerFields(index) {
    const know = document.getElementById(`consumer_${index}_know`).value;
    document.getElementById(`consumer_${index}_w_field`).style.display = (know === 'yes' ? 'block' : 'none');
    document.getElementById(`consumer_${index}_va_fields`).style.display = (know === 'yes' ? 'none' : 'block');
}

function calcWorkTime() {
    let wh = document.getElementById('know_wh').value === 'yes'
        ? Number(document.getElementById('worktime_wh').value)
        : mahToWh(
            Number(document.getElementById('worktime_mah').value),
            Number(document.getElementById('worktime_v').value)
          );

    const vWh = validateFields([
        { name: 'Ємність павербанку', value: wh, positive: true }
    ]);
    if (!vWh.ok) return alert(vWh.message);

    let count = Number(document.getElementById('worktime_count').value);

    const vCount = validateFields([
        { name: 'Кількість споживачів', value: count, min: 1 }
    ]);
    if (!vCount.ok) return alert(vCount.message);

    let totalW = 0;
    for (let i = 1; i <= count; i++) {
        const knowType = document.getElementById(`consumer_${i}_know`).value;
        let consumerW = 0;

        if (knowType === 'yes') {
            consumerW = Number(document.getElementById(`consumer_${i}_w`).value);
            const vC = validateFields([
                { name: `Споживач №${i} (потужність, W)`, value: consumerW, positive: true }
            ]);
            if (!vC.ok) return alert(vC.message);
        } else {
            const vV = Number(document.getElementById(`consumer_${i}_v`).value);
            const vA = Number(document.getElementById(`consumer_${i}_a`).value);
            const vC = validateFields([
                { name: `Споживач №${i} (напруга, V)`, value: vV, positive: true },
                { name: `Споживач №${i} (струм, A)`, value: vA, positive: true }
            ]);
            if (!vC.ok) return alert(vC.message);
            consumerW = vV * vA;
        }
        totalW += consumerW;
    }

    let mins = calculateSimpleTime(wh, totalW || 1);
    const resultDiv = document.getElementById('calcWorkTimeResult');
    resultDiv.textContent = `Час роботи: ${formatTime(mins)}`;
    resultDiv.style.display = 'block';
}
// ============================================================================
// 6. ФУНКЦІЇ ДЛЯ КНОПКИ 4 – СКІЛЬКИ БУЛО СВІТЛО?
// ============================================================================
function openCalcLightTimeForm() {
    document.getElementById('light_type').value = 'lithium';
    document.getElementById('light_capacity_value').value = '';
    document.getElementById('light_p1').value = '';
    document.getElementById('light_p2').value = '';
    document.getElementById('light_w').value = '';
    document.getElementById('lead_unit_select').value = 'wh';
    toggleLightCapacityFields();
    openModal('calcLightTimeModal');
}

function toggleLightCapacityFields() {
    const type = document.getElementById('light_type').value;
    const label = document.getElementById('light_capacity_label');
    const input = document.getElementById('light_capacity_value');
    const leadUnitSelect = document.getElementById('lead_unit_select');
    const leadVoltageField = document.getElementById('lead_voltage_field');
    
    leadUnitSelect.style.display = 'none';
    leadVoltageField.style.display = 'none';
    
    if (type === 'lifepo4') {
        label.textContent = 'Ємність у Wh:';
        input.placeholder = 'Наприклад: 37';
        input.type = 'number';
    } 
    else if (type === 'lead_acid') {
        label.textContent = 'Ємність:';
        input.placeholder = 'Введіть значення';
        leadUnitSelect.style.display = 'block';
        toggleLeadVoltageField();
    } 
    else {
        label.textContent = 'Ємність ПБ (mAh):';
        input.placeholder = 'Наприклад: 10000';
    }
}

function toggleLeadVoltageField() {
    const leadUnit = document.getElementById('lead_unit_select').value;
    const leadVoltageField = document.getElementById('lead_voltage_field');
    
    if (leadUnit === 'ah') {
        leadVoltageField.style.display = 'block';
    } else {
        leadVoltageField.style.display = 'none';
    }
}

function calcLightTime() {
    const type = document.getElementById('light_type').value;
    const value = Number(document.getElementById('light_capacity_value').value);
    
    let unit = 'mah';
    let voltage = null;
    
    if (type === 'lifepo4') {
        unit = 'wh';
    } else if (type === 'lead_acid') {
        unit = document.getElementById('lead_unit_select').value;
        if (unit === 'ah') {
            voltage = Number(document.getElementById('lead_voltage').value);
            const vV = validateFields([
                { name: 'Напруга (V)', value: voltage, positive: true }
            ]);
            if (!vV.ok) return alert(vV.message);
        }
    }
    
    const capacityWh = getCapacityWh({ type, unit, value, voltage });
    
    const p1 = Number(document.getElementById('light_p1').value);
    const p2 = Number(document.getElementById('light_p2').value);
    const w = Number(document.getElementById('light_w').value);

    const v = validateFields([
        { name: 'Ємність', value: capacityWh, positive: true },
        { name: '% спочатку', value: p1, min: 0, max: 100 },
        { name: '% в кінці', value: p2, min: 0, max: 100 },
        { name: 'Потужність споживача (W)', value: w, positive: true }
    ]);
    if (!v.ok) return alert(v.message);
    
    const mins = calculateLightTime(capacityWh, p1, p2, w);
    const res = document.getElementById('calcLightTimeResult');    
    res.textContent = `Світло було: ${formatTime(mins)}`;
    res.style.display = 'block';
}

// ============================================================================
// 7. ФУНКЦІЇ ДЛЯ КНОПКИ 5 – АНАЛІЗ ЗАРЯДОК
// ============================================================================
function openCalcChargeStatsForm() {
    document.getElementById('know_pb_wh').value = 'yes';
    document.getElementById('charge_stats_wh').value = '';
    document.getElementById('charge_stats_mah').value = '';
    document.getElementById('charge_stats_p2').value = '';
    document.getElementById('charge_stats_p4').value = '';
    document.getElementById('charge_stats_charge_power').value = '';
    document.getElementById('charge_devices_container').innerHTML = '';
    togglePbWhFields();
    openModal('calcChargeStatsModal');
}

function togglePbWhFields() {
    const know = document.getElementById('know_pb_wh').value;
    document.getElementById('pb_wh_field').style.display = (know === 'yes' ? 'block' : 'none');
    document.getElementById('pb_mah_field').style.display = (know === 'yes' ? 'none' : 'block');
    updateChargeDeviceFields();
}

function updateChargeDeviceFields() {
    const count = Number(document.getElementById('charge_stats_p4').value) || 0;
    const container = document.getElementById('charge_devices_container');
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.style.border = '1px solid #444';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <label style="color: #ff9900;">Споживач №${i}:</label>
            <label>Знаєте Wh?</label>
            <select id="device_${i}_know_wh" onchange="toggleDeviceWhFields(${i})" style="margin-bottom: 8px;">
                <option value="yes">Так</option>
                <option value="no">mAh</option>
            </select>
            <div id="device_${i}_wh_field">
                <label>Wh:</label><input type="number" id="device_${i}_wh" placeholder="Наприклад: 15" style="width: 100%; margin-bottom: 8px;">
            </div>
            <div id="device_${i}_mah_field" style="display: none;">
                <label>mAh:</label><input type="number" id="device_${i}_mah" placeholder="Наприклад: 4000" style="width: 100%; margin-bottom: 8px;">
            </div>
            <label>Поточний % заряду споживача:</label>
            <input type="number" id="device_${i}_p" placeholder="Наприклад: 20" style="width: 100%;">
        `;
        container.appendChild(div);
    }
}

function toggleDeviceWhFields(index) {
    const know = document.getElementById(`device_${index}_know_wh`).value;
    document.getElementById(`device_${index}_wh_field`).style.display = (know === 'yes' ? 'block' : 'none');
    document.getElementById(`device_${index}_mah_field`).style.display = (know === 'yes' ? 'none' : 'block');
}

function calcChargeStats() {
    const knowPbWh = document.getElementById('know_pb_wh').value;
    let pbCapacityWh = 0;
    
    if (knowPbWh === 'yes') {
        pbCapacityWh = Number(document.getElementById('charge_stats_wh').value);
    } else {
        pbCapacityWh = mahToWh(Number(document.getElementById('charge_stats_mah').value));
    }
    
    const pbCurrentPercent = Number(document.getElementById('charge_stats_p2').value);
    const chargePower = Number(document.getElementById('charge_stats_charge_power').value);
    const deviceCount = Number(document.getElementById('charge_stats_p4').value) || 0;

    const vGeneral = validateFields([
        { name: 'Ємність ПБ', value: pbCapacityWh, positive: true },
        { name: 'Поточний % заряду ПБ', value: pbCurrentPercent, min: 0, max: 100 },
        { name: 'Потужність зарядки (W)', value: chargePower, positive: true },
        { name: 'Кількість споживачів', value: deviceCount, min: 1 }
    ]);
    if (!vGeneral.ok) return alert(vGeneral.message);
    
    let tempPB_Wh = pbCapacityWh * (pbCurrentPercent / 100);
    const effPower = chargePower * EFFICIENCY.CHARGE_LI_ION;
    let totalTimeMinutes = 0;
    let devicesReport = [];
    
    for (let i = 1; i <= deviceCount; i++) {
        const knowDeviceWh = document.getElementById(`device_${i}_know_wh`).value;
        let deviceCapacityWh = 0;
        
        if (knowDeviceWh === 'yes') {
            deviceCapacityWh = Number(document.getElementById(`device_${i}_wh`).value);
        } else {
            deviceCapacityWh = mahToWh(Number(document.getElementById(`device_${i}_mah`).value));
        }
        
        const deviceCurrentPercent = Number(document.getElementById(`device_${i}_p`).value) || 0;

        const vDevice = validateFields([
            { name: `Споживач №${i} (ємність)`, value: deviceCapacityWh, positive: true },
            { name: `Споживач №${i} (% заряду)`, value: deviceCurrentPercent, min: 0, max: 100 }
        ]);
        if (!vDevice.ok) return alert(vDevice.message);
        
        const deviceCurrentWh = deviceCapacityWh * (deviceCurrentPercent / 100);
        const neededWh = deviceCapacityWh - deviceCurrentWh;
        const neededFromBank = neededWh / EFFICIENCY.CHARGE_LI_ION;
        
        let finalPercent = 0;
        let chargeTimeHours = 0;
        
        if (tempPB_Wh >= neededFromBank) {
            finalPercent = 100;
            
            if (deviceCurrentPercent < 80) {
                const whTo80 = (deviceCapacityWh * 0.8) - deviceCurrentWh;
                const whAfter80 = deviceCapacityWh * 0.2;
                chargeTimeHours = (whTo80 / effPower) + (whAfter80 / effPower * CCCV_FACTORS.CV_PENALTY);
            } else {
                chargeTimeHours = (neededWh / effPower) * CCCV_FACTORS.CV_PENALTY;
            }
            
            tempPB_Wh -= neededFromBank;
        } else {
            const availableWh = tempPB_Wh * EFFICIENCY.CHARGE_LI_ION;
            finalPercent = ((deviceCurrentWh + availableWh) / deviceCapacityWh) * 100;
            
            if (finalPercent <= 80) {
                chargeTimeHours = availableWh / effPower;
            } else {
                const whTo80 = Math.max(0, (deviceCapacityWh * 0.8) - deviceCurrentWh);
                const whInCV = availableWh - whTo80;
                chargeTimeHours = (whTo80 / effPower) + (whInCV / effPower * CCCV_FACTORS.CV_PENALTY);
            }
            
            tempPB_Wh = 0;
        }
        
        const minutes = Math.round(chargeTimeHours * 60);
        totalTimeMinutes += minutes;
        
        devicesReport.push({
            num: i,
            finalPercent: finalPercent.toFixed(1),
            time: formatTime(minutes)
        });
    }
    
    const finalPBPercent = (tempPB_Wh / pbCapacityWh) * 100;
    const totalH = Math.floor(totalTimeMinutes / 60);
    const totalM = totalTimeMinutes % 60;
    
    let devicesHtml = devicesReport.map(d => 
        `<div style="border-bottom: 1px solid #555; padding: 5px 0;">
            🔹 Споживач №${d.num}: до ${d.finalPercent}% (≈${d.time})
        </div>`
    ).join('');
    
    const resultDiv = document.getElementById('calcChargeStatsResult');
    resultDiv.innerHTML = `
        <b>📊 ЗВІТ</b><br>
        <b>Залишок ПБ:</b> ${finalPBPercent.toFixed(1)}%<br><br>
        ${devicesHtml}<br>
        <b>⏱ Загальний час:</b> ${totalH}г ${totalM}хв
    `;
    resultDiv.style.display = 'block';
}
// ============================================================================
// 8. ФУНКЦІЇ ДЛЯ КНОПКИ 6 – РОБОТА ЛІХТАРИКА (з базою чіпів)
// ============================================================================
function toggleFlashlightCapacityFields() {
    const know = document.getElementById('flashlight_know_capacity').value;
    const label = document.getElementById('flashlight_mah_label');
    const input = document.getElementById('flashlight_mah');
    if (know === 'wh') {
        label.textContent = 'Ємність акумулятора (Wh):';
        input.placeholder = 'Наприклад: 18.5';
    } else {
        label.textContent = 'Ємність акумулятора (mAh):';
        input.placeholder = 'Наприклад: 5000';
    }
}

// Заповнюємо селект категорій чіпів при завантаженні сторінки
function initFlashlightCategories() {
    const select = document.getElementById('flashlight_chip_category');
    if (!select) return;
    select.innerHTML = '<option value="">-- Оберіть тип --</option>' +
        LED_CHIP_CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
}

// Перемикання режимів точності (standard / chip / manual)
function toggleFlashlightMode() {
    const mode = document.getElementById('flashlight_mode').value;
    const chipSection = document.getElementById('flashlight_chip_section');
    const manualSection = document.getElementById('flashlight_manual_section');
    const driverSection = document.getElementById('flashlight_driver_section');

    chipSection.style.display = (mode === 'chip') ? 'block' : 'none';
    manualSection.style.display = (mode === 'manual') ? 'block' : 'none';
    driverSection.style.display = (mode === 'standard') ? 'none' : 'block';
}

// Оновлення списку моделей чіпів при виборі категорії
function updateFlashlightChipList() {
    const category = document.getElementById('flashlight_chip_category').value;
    const modelSelect = document.getElementById('flashlight_chip_model');
    const infoDiv = document.getElementById('flashlight_chip_info');

    if (!category) {
        modelSelect.innerHTML = '<option value="">-- Спочатку оберіть тип --</option>';
        infoDiv.style.display = 'none';
        return;
    }

    const chips = LED_CHIPS[category] || [];
    modelSelect.innerHTML = '<option value="">-- Оберіть модель --</option>' +
        chips.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    infoDiv.style.display = 'none';
}

// Оновлення інформації про вибраний чіп (лм/Вт)
function updateFlashlightChipInfo() {
    const category = document.getElementById('flashlight_chip_category').value;
    const chipId = document.getElementById('flashlight_chip_model').value;
    const infoDiv = document.getElementById('flashlight_chip_info');

    if (!category || !chipId) {
        infoDiv.style.display = 'none';
        return;
    }

    const chip = LED_CHIPS[category].find(c => c.id === chipId);
    if (!chip) return;

    const ratio = getChipLumensPerWatt(chip);
    infoDiv.textContent = `ℹ️ ${ratio.toFixed(1)} лм/Вт (max ${chip.maxLumens} lm, ${chip.maxWatts} W)`;
    infoDiv.style.display = 'block';
}

function openCalcFlashlightForm() {
    document.getElementById('flashlight_mah').value = '';
    document.getElementById('flashlight_percentage').value = '';
    document.getElementById('flashlight_lm').value = '';
    document.getElementById('flashlight_know_capacity').value = 'mah';
    document.getElementById('flashlight_mode').value = 'standard';
    document.getElementById('flashlight_chip_category').value = '';
    document.getElementById('flashlight_chip_model').innerHTML = '<option value="">-- Спочатку оберіть тип --</option>';
    document.getElementById('flashlight_chip_info').style.display = 'none';
    document.getElementById('flashlight_manual_watts').value = '';
    document.getElementById('flashlight_driver_eff').value = '85';

    toggleFlashlightCapacityFields();
    toggleFlashlightMode();
    openModal('calcFlashlightModal');
}

function calcFlashlight() {
    const know = document.getElementById('flashlight_know_capacity').value;
    let whFull;
    if (know === 'wh') {
        whFull = Number(document.getElementById('flashlight_mah').value);
    } else {
        whFull = mahToWh(Number(document.getElementById('flashlight_mah').value));
    }
    const p = Number(document.getElementById('flashlight_percentage').value);
    const lm = Number(document.getElementById('flashlight_lm').value);
    const mode = document.getElementById('flashlight_mode').value;

    // БАЗОВА ВАЛІДАЦІЯ
    const vBase = validateFields([
        { name: 'Ємність акумулятора', value: whFull, positive: true },
        { name: 'Поточний % заряду', value: p, min: 0, max: 100 },
        { name: 'Бажана яскравість (lm)', value: lm, positive: true }
    ]);
    if (!vBase.ok) return alert(vBase.message);

    const res = document.getElementById('calcFlashlightResult');
    let mins = 0;
    let modeText = '';

    // РЕЖИМ 1: Стандартний (100 лм/Вт)
    if (mode === 'standard') {
        mins = calculateFlashlightTime(whFull, p, lm);
        modeText = 'Стандартний розрахунок (100 лм/Вт)';
    }

    // РЕЖИМ 2: За характеристиками чіпа
    else if (mode === 'chip') {
        const category = document.getElementById('flashlight_chip_category').value;
        const chipId = document.getElementById('flashlight_chip_model').value;

        if (!category || !chipId) {
            return alert('Будь ласка, оберіть тип і модель чіпа');
        }

        const driverEff = Number(document.getElementById('flashlight_driver_eff').value) / 100;
        const vEff = validateFields([
            { name: 'ККД драйвера (%)', value: driverEff * 100, min: 50, max: 100 }
        ]);
        if (!vEff.ok) return alert(vEff.message);

        const chip = LED_CHIPS[category].find(c => c.id === chipId);
        if (!chip) return alert('Чіп не знайдено');

        mins = calculateFlashlightTimeFromChip(whFull, p, lm, chip, driverEff);
        const ratio = getChipLumensPerWatt(chip);
        modeText = `Чіп: ${chip.name} (${ratio.toFixed(1)} лм/Вт, драйвер ${(driverEff*100).toFixed(0)}%)`;
    }

    // РЕЖИМ 3: Ручний (введення W)
    else if (mode === 'manual') {
        const watts = Number(document.getElementById('flashlight_manual_watts').value);
        const driverEff = Number(document.getElementById('flashlight_driver_eff').value) / 100;

        const vManual = validateFields([
            { name: 'Споживання (W)', value: watts, positive: true },
            { name: 'ККД драйвера (%)', value: driverEff * 100, min: 50, max: 100 }
        ]);
        if (!vManual.ok) return alert(vManual.message);

        mins = calculateFlashlightTimeFromWatts(whFull, p, watts, driverEff);
        const computedRatio = lm / watts;
        modeText = `Ручний режим (${watts} W, ${computedRatio.toFixed(1)} лм/Вт, драйвер ${(driverEff*100).toFixed(0)}%)`;
    }

    res.innerHTML = `
        <b>⏱ Час роботи:</b> ${formatTime(mins)}<br>
        <span style="color: #888; font-size: 12px;">Режим: ${modeText}</span>
    `;
    res.style.display = 'block';
}

// ============================================================================
// 9. ФУНКЦІЇ ДЛЯ КНОПКИ 7 – РЕЖИМ ВИЖИВАННЯ (ПЛАНУВАННЯ)
// ============================================================================
function openSurvivalModeForm() {
    document.getElementById('survival_type').value = 'lithium';
    document.getElementById('survival_capacity_value').value = '';
    document.getElementById('survival_p').value = '';
    document.getElementById('survival_hours_needed').value = '';
    document.getElementById('survival_lead_unit').value = 'wh';
    document.getElementById('survival_know_capacity').value = 'mah';
    toggleSurvivalCapacityFields();
    openModal('survivalModeModal');
}

function toggleSurvivalCapacityFields() {
    const type = document.getElementById('survival_type').value;
    const label = document.getElementById('survival_capacity_label');
    const input = document.getElementById('survival_capacity_value');
    const leadUnitSelect = document.getElementById('survival_lead_unit');
    const voltageField = document.getElementById('survival_voltage_field');
    const knowCapGroup = document.getElementById('survival_know_capacity_group');
    const knowCap = document.getElementById('survival_know_capacity').value;
    
    leadUnitSelect.style.display = 'none';
    voltageField.style.display = 'none';
    knowCapGroup.style.display = 'none';
    
    if (type === 'lifepo4') {
        label.textContent = 'Ємність у Wh:';
        input.placeholder = 'Наприклад: 37';
    } 
    else if (type === 'lead_acid') {
        label.textContent = 'Ємність:';
        input.placeholder = 'Введіть значення';
        leadUnitSelect.style.display = 'block';
        toggleSurvivalVoltageField();
    } 
    else {
        knowCapGroup.style.display = 'block';
        if (knowCap === 'wh') {
            label.textContent = 'Ємність ПБ (Wh):';
            input.placeholder = 'Наприклад: 37';
        } else {
            label.textContent = 'Ємність ПБ (mAh):';
            input.placeholder = 'Наприклад: 10000';
        }
    }
}

function toggleSurvivalVoltageField() {
    const leadUnit = document.getElementById('survival_lead_unit').value;
    const voltageField = document.getElementById('survival_voltage_field');
    
    if (leadUnit === 'ah') {
        voltageField.style.display = 'block';
    } else {
        voltageField.style.display = 'none';
    }
}

function survivalMode() {
    const type = document.getElementById('survival_type').value;
    const value = Number(document.getElementById('survival_capacity_value').value);
    
    let unit = 'mah';
    let voltage = null;
    
    if (type === 'lifepo4') {
        unit = 'wh';
    } else if (type === 'lead_acid') {
        unit = document.getElementById('survival_lead_unit').value;
        if (unit === 'ah') {
            voltage = Number(document.getElementById('survival_voltage').value);
            const vV = validateFields([
                { name: 'Напруга (V)', value: voltage, positive: true }
            ]);
            if (!vV.ok) return alert(vV.message);
        }
    } else {
        unit = document.getElementById('survival_know_capacity').value;
    }
    
    const capacityWh = getCapacityWh({ type, unit, value, voltage });
    
    const p = Number(document.getElementById('survival_p').value);
    const hours = Number(document.getElementById('survival_hours_needed').value);

    const v = validateFields([
        { name: 'Ємність', value: capacityWh, positive: true },
        { name: 'Поточний % заряду', value: p, min: 0, max: 100 },
        { name: 'Кількість годин', value: hours, positive: true }
    ]);
    if (!v.ok) return alert(v.message);
    
    const { availableWh, maxW } = calculateSurvivalMaxPower(capacityWh, p, hours);
    const res = document.getElementById('survivalModeResult');
    res.textContent = `Доступно енергії: ${availableWh.toFixed(1)} Wh\nЛіміт споживання: ${maxW.toFixed(2)} W\n\nЩоб вистачило на ${hours} год., не перевищуйте ${maxW.toFixed(1)} W сумарної потужності.`;
    res.style.display = 'block';
}
// ============================================================================
// 10. ФУНКЦІЇ ДЛЯ КНОПКИ 8 – АУДИТ ПБ (ПЕРЕВІРКА РЕАЛЬНОЇ ЯКОСТІ)
// ============================================================================
function openAuditPowerbankForm() {
    document.getElementById('audit_battery_type').value = 'lithium';
    document.getElementById('audit_capacity_value').value = '';
    document.getElementById('audit_hours').value = '';
    document.getElementById('audit_watts').value = '';
    document.getElementById('audit_percent_used').value = '';
    document.getElementById('audit_lead_unit').value = 'wh';
    document.getElementById('audit_know_capacity').value = 'mah';
    toggleAuditCapacityFields();
    openModal('auditPowerbankModal');
}

function toggleAuditCapacityFields() {
    const type = document.getElementById('audit_battery_type').value;
    const label = document.getElementById('audit_capacity_label');
    const input = document.getElementById('audit_capacity_value');
    const leadUnitSelect = document.getElementById('audit_lead_unit');
    const voltageField = document.getElementById('audit_voltage_field');
    const knowCapGroup = document.getElementById('audit_know_capacity_group');
    const knowCap = document.getElementById('audit_know_capacity').value;
    
    leadUnitSelect.style.display = 'none';
    voltageField.style.display = 'none';
    knowCapGroup.style.display = 'none';
    
    if (type === 'lifepo4') {
        label.textContent = 'Ємність у Wh:';
        input.placeholder = 'Наприклад: 37';
    } 
    else if (type === 'lead_acid') {
        label.textContent = 'Ємність:';
        input.placeholder = 'Введіть значення';
        leadUnitSelect.style.display = 'block';
        toggleAuditVoltageField();
    } 
    else {
        knowCapGroup.style.display = 'block';
        if (knowCap === 'wh') {
            label.textContent = 'Ємність ПБ (Wh):';
            input.placeholder = 'Наприклад: 37';
        } else {
            label.textContent = 'Ємність ПБ (mAh):';
            input.placeholder = 'Наприклад: 10000';
        }
    }
}

function toggleAuditVoltageField() {
    const leadUnit = document.getElementById('audit_lead_unit').value;
    const voltageField = document.getElementById('audit_voltage_field');
    
    if (leadUnit === 'ah') {
        voltageField.style.display = 'block';
    } else {
        voltageField.style.display = 'none';
    }
}

function auditPowerbank() {
    const type = document.getElementById('audit_battery_type').value;
    const value = Number(document.getElementById('audit_capacity_value').value);
    
    let unit = 'mah';
    let voltage = null;
    
    if (type === 'lifepo4') {
        unit = 'wh';
    } else if (type === 'lead_acid') {
        unit = document.getElementById('audit_lead_unit').value;
        if (unit === 'ah') {
            voltage = Number(document.getElementById('audit_voltage').value);
            const vV = validateFields([
                { name: 'Напруга (V)', value: voltage, positive: true }
            ]);
            if (!vV.ok) return alert(vV.message);
        }
    } else {
        unit = document.getElementById('audit_know_capacity').value;
    }
    
    const nominalWh = getCapacityWh({ type, unit, value, voltage });
    
    const hours = Number(document.getElementById('audit_hours').value);
    const watts = Number(document.getElementById('audit_watts').value);
    const percentUsed = Number(document.getElementById('audit_percent_used').value);

    const v = validateFields([
        { name: 'Ємність', value: nominalWh, positive: true },
        { name: 'Годин роботи', value: hours, positive: true },
        { name: 'Потужність споживача (W)', value: watts, positive: true },
        { name: '% витраченого заряду', value: percentUsed, min: 0, max: 100 }
    ]);
    if (!v.ok) return alert(v.message);
    
    const realWh = watts * hours;
    const efficiency = calculateAuditEfficiency(nominalWh, percentUsed, realWh);
    const realCapacityWh = calculateRealCapacity(realWh, percentUsed);
    const realCapacityMah = calculateRealCapacityMah(realCapacityWh, type);
    
    const { icon: qualityIcon, text: qualityStatus } = getQualityStatus(efficiency);
    
    const res = document.getElementById('auditPowerbankResult');
    res.innerHTML = `
        <b>📊 Результати аудиту:</b><br>
        Тип АКБ: ${type === 'lithium' ? 'Li-ion' : type === 'lifepo4' ? 'LiFePO4' : 'Свинцевий'}<br>
        Заявлено: ${nominalWh.toFixed(1)} Wh<br>
        Реально віддано: ${realWh.toFixed(1)} Wh (за ${hours} год.)<br>
        Реальна ємність (100%): ${realCapacityWh.toFixed(1)} Wh (${Math.round(realCapacityMah)} mAh)<br>
        <br>
        <b>${qualityIcon} Ефективність: ${efficiency.toFixed(1)}%</b><br>
        ${qualityStatus}
    `;
    res.style.display = 'block';
}

// ============================================================================
// 11. ФУНКЦІЇ ДЛЯ КНОПКИ 9 – HOME BACKUP (КВАРТИРА/ДБЖ)
// ============================================================================
function openCalcHomeBackupForm() {
    document.getElementById('backup_type').value = 'lifepo4';
    document.getElementById('backup_know_wh').value = 'yes';
    document.getElementById('backup_wh').value = '';
    document.getElementById('backup_ah').value = '';
    document.getElementById('backup_mah').value = '';
    document.getElementById('backup_voltage').value = '12';
    document.getElementById('backup_count').value = '';
    document.getElementById('backup_consumers_container').innerHTML = '';
    toggleBackupWhFields();
    openModal('calcHomeBackupModal');
}

function toggleBackupWhFields() {
    const know = document.getElementById('backup_know_wh').value;
    const type = document.getElementById('backup_type').value;
    document.getElementById('backup_wh_field').style.display = (know === 'yes' ? 'block' : 'none');
    document.getElementById('backup_ah_field').style.display = (know === 'no_ah' ? 'block' : 'none');
    document.getElementById('backup_mah_field').style.display = (know === 'no_mah' ? 'block' : 'none');
    document.getElementById('backup_voltage_field').style.display = (know === 'no_ah' && type !== 'lifepo4' ? 'block' : 'none');
    updateBackupConsumerFields();
}

function updateBackupConsumerFields() {
    const count = document.getElementById('backup_count').value;
    const container = document.getElementById('backup_consumers_container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>№${i}: W чи V&A?</label>
            <select id="backup_consumer_${i}_know" onchange="toggleBackupConsumerFields(${i})">
                <option value="w">W</option>
                <option value="va">V & A</option>
            </select>
            <div id="backup_consumer_${i}_w_field">
                <label>W:</label><input type="number" id="backup_consumer_${i}_w">
            </div>
            <div id="backup_consumer_${i}_va_fields" style="display: none;">
                <label>V:</label><input type="number" id="backup_consumer_${i}_v">
                <label>A:</label><input type="number" id="backup_consumer_${i}_a">
            </div>
        `;
        container.appendChild(div);
    }
}

function toggleBackupConsumerFields(index) {
    const know = document.getElementById(`backup_consumer_${index}_know`).value;
    document.getElementById(`backup_consumer_${index}_w_field`).style.display = (know === 'w' ? 'block' : 'none');
    document.getElementById(`backup_consumer_${index}_va_fields`).style.display = (know === 'va' ? 'block' : 'none');
}

function calcHomeBackup() {
    const type = document.getElementById('backup_type').value;
    const know = document.getElementById('backup_know_wh').value;
    
    let unit = 'wh';
    let value = 0;
    let voltage = null;
    
    if (know === 'yes') {
        unit = 'wh';
        value = Number(document.getElementById('backup_wh').value);
    } else if (know === 'no_ah') {
        unit = 'ah';
        value = Number(document.getElementById('backup_ah').value);
        voltage = Number(document.getElementById('backup_voltage').value);
        const vV = validateFields([
            { name: 'Напруга (V)', value: voltage, positive: true }
        ]);
        if (!vV.ok) return alert(vV.message);
    } else if (know === 'no_mah') {
        unit = 'mah';
        value = Number(document.getElementById('backup_mah').value);
    }
    
    const capacityWh = getCapacityWh({ type, unit, value, voltage });

    const vCap = validateFields([
        { name: 'Ємність батареї', value: capacityWh, positive: true }
    ]);
    if (!vCap.ok) return alert(vCap.message);
    
    const count = Number(document.getElementById('backup_count').value) || 0;

    const vCount = validateFields([
        { name: 'Кількість типів споживачів', value: count, min: 1 }
    ]);
    if (!vCount.ok) return alert(vCount.message);

    let totalW = 0;
    
    for (let i = 1; i <= count; i++) {
        const knowType = document.getElementById(`backup_consumer_${i}_know`).value;
        if (knowType === 'w') {
            const w = Number(document.getElementById(`backup_consumer_${i}_w`).value) || 0;
            const vC = validateFields([
                { name: `Споживач №${i} (потужність, W)`, value: w, positive: true }
            ]);
            if (!vC.ok) return alert(vC.message);
            totalW += w;
        } else {
            const v = Number(document.getElementById(`backup_consumer_${i}_v`).value) || 0;
            const a = Number(document.getElementById(`backup_consumer_${i}_a`).value) || 0;
            const vC = validateFields([
                { name: `Споживач №${i} (напруга, V)`, value: v, positive: true },
                { name: `Споживач №${i} (струм, A)`, value: a, positive: true }
            ]);
            if (!vC.ok) return alert(vC.message);
            totalW += v * a;
        }
    }
    
    const efficiency = getSystemEfficiency(type);
    const { usableWh, hours } = calculateHomeBackupTime(capacityWh, totalW, type);
    
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    const dod = (type === 'lifepo4') ? '80-90%' : '50%';
    
    const res = document.getElementById('calcHomeBackupResult');
    res.innerHTML = `
        <b>🏠 Home Backup Розрахунок:</b><br>
        Ємність: ${capacityWh.toFixed(1)} Wh<br>
        Корисна ємність (${(efficiency*100).toFixed(0)}% ККД): ${usableWh.toFixed(1)} Wh<br>
        Сумарне споживання: ${totalW.toFixed(1)} W<br>
        <br>
        <b>⏱️ Час роботи: ${h} год. ${m} хв.</b><br>
        Рекомендована глибина розряду: ${dod}<br>
        ${type === 'lead_acid' ? '⚠️ Свинцевий АКБ не бажано розряджати нижче 50%' : '✅ LiFePO4 можна розряджати до 80-90%'}
    `;
    res.style.display = 'block';
}

// ============================================================================
// 12. ФУНКЦІЇ ДЛЯ КНОПКИ 10 – РЕГЕНЕРАЦІЯ (ЗАРЯДКА ВЕЛИКИХ АКБ/СТАНЦІЙ)
// ============================================================================
function openCalcRechargeForm() {
    document.getElementById('recharge_type').value = 'lifepo4';
    document.getElementById('recharge_know_capacity').value = 'wh';
    document.getElementById('recharge_wh').value = '';
    document.getElementById('recharge_ah').value = '';
    document.getElementById('recharge_mah').value = '';
    document.getElementById('recharge_voltage').value = '12';
    document.getElementById('recharge_current_perc').value = '';
    document.getElementById('recharge_power').value = '';
    toggleRechargeCapacityFields();
    openModal('calcRechargeModal');
}

function toggleRechargeCapacityFields() {
    const know = document.getElementById('recharge_know_capacity').value;
    const type = document.getElementById('recharge_type').value;
    document.getElementById('recharge_wh_field').style.display = (know === 'wh' ? 'block' : 'none');
    document.getElementById('recharge_ah_field').style.display = (know === 'ah' ? 'block' : 'none');
    document.getElementById('recharge_mah_field').style.display = (know === 'mah' ? 'block' : 'none');
    document.getElementById('recharge_voltage_field').style.display = (know === 'ah' && type !== 'lifepo4' ? 'block' : 'none');
}

function calcRecharge() {
    const type = document.getElementById('recharge_type').value;
    const knowCap = document.getElementById('recharge_know_capacity').value;
    
    let unit = knowCap;
    let value = 0;
    let voltage = null;
    
    if (knowCap === 'wh') {
        value = Number(document.getElementById('recharge_wh').value);
    } else if (knowCap === 'ah') {
        value = Number(document.getElementById('recharge_ah').value);
        voltage = Number(document.getElementById('recharge_voltage').value);
        if (!voltage) voltage = (type === 'lifepo4') ? 12.8 : 12;
    } else if (knowCap === 'mah') {
        value = Number(document.getElementById('recharge_mah').value);
    }
    
    const capacityWh = getCapacityWh({ type, unit, value, voltage });
    const currentPerc = Number(document.getElementById('recharge_current_perc').value);
    const chargePower = Number(document.getElementById('recharge_power').value);

    const v = validateFields([
        { name: 'Ємність батареї', value: capacityWh, positive: true },
        { name: 'Поточний % заряду', value: currentPerc, min: 0, max: 100 },
        { name: 'Потужність зарядного пристрою (W)', value: chargePower, positive: true }
    ]);
    if (!v.ok) return alert(v.message);
    
    const res = document.getElementById('calcRechargeResult');
    
    if (currentPerc === 100) {
        res.innerHTML = '<b style="color:#4CAF50;">✅ Акумулятор вже повністю заряджений!</b>';
        res.style.display = 'block';
        return;
    }
    
    const { neededWh, effectivePower, hours } = calculateRechargeTime(capacityWh, currentPerc, chargePower, type);
    const efficiency = getChargeEfficiency(type);
    
    let typeName = 'Li-ion';
    if (type === 'lifepo4') typeName = 'LiFePO4';
    else if (type === 'lead_acid') typeName = 'Свинцевий (Lead-Acid / AGM / Gel)';
    
    let h = Math.floor(hours);
    let m = Math.round((hours - h) * 60);
    if (m === 60) { h += 1; m = 0; }
    
    res.innerHTML = `
        <b>🔌 Результат розрахунку:</b><br>
        Тип АКБ: ${typeName}<br>
        Потрібно зарядити: <b>${neededWh.toFixed(1)} Wh</b> (${currentPerc}% → 100%)<br>
        <br>
        <b>⚡ Засвоєна потужність:</b> ${effectivePower.toFixed(1)} W <br>
        <span style="color:#aaa; font-size:12px;">(З урахуванням ККД хімії акумулятора ${(efficiency*100).toFixed(0)}%)</span><br>
        <br>
        <b>⏱ Орієнтовний час зарядки:</b><br>
        <span style="font-size: 1.3em; color: #4CAF50;"><b>${h} год. ${m} хв.</b></span>
        ${type === 'lead_acid' ? '<br><br><span style="color:#ff9900; font-size:12px;">⚠️ <b>Важливо:</b> Свинцеві АКБ мають довгу фазу "абсорбції" (останні 15-20% ємності заряджаються малим струмом). Тому реальний час до 100% буде відчутно довшим.</span>' : ''}
    `;
    res.style.display = 'block';
}

// ============================================================================
// 13. ФУНКЦІЇ ДЛЯ КНОПКИ 11 – СОНЯЧНІ ПАНЕЛІ (SOLAR HYBRID)
// ============================================================================
const SolarHybrid = {
    config: {
        CACHE_TTL_DAYS: 7,
        API_TIMEOUT_MS: 5000,
        SYSTEM_EFFICIENCY: EFFICIENCY.SOLAR_SYSTEM,
        UKRAINE_LAT_RANGE: [46, 52],
        UKRAINE_LON_RANGE: [22, 40]
    },
    cache: {
        get: function(lat, lon) {
            try {
                const key = `solar_${lat.toFixed(2)}_${lon.toFixed(2)}`;
                const cached = localStorage.getItem(key);
                if (!cached) return null;
                const data = JSON.parse(cached);
                const now = Date.now();
                const ttl = this.config.CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
                if (now - data.timestamp < ttl) return data.profile;
                localStorage.removeItem(key);
                return null;
            } catch (e) { return null; }
        },
        set: function(lat, lon, profile) {
            try {
                const key = `solar_${lat.toFixed(2)}_${lon.toFixed(2)}`;
                localStorage.setItem(key, JSON.stringify({ lat, lon, timestamp: Date.now(), profile, peak_power_norm: 1.0 }));
            } catch (e) {}
        }
    },
    api: {
        endpoint: 'https://re.jrc.ec.europa.eu/api/v5_2/profile',
        fetch: async function(lat, lon, tilt, azimuth, totalPowerKw) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), SolarHybrid.config.API_TIMEOUT_MS);
            try {
                const url = `${this.endpoint}?lat=${lat}&lon=${lon}&outputformat=json&peakpower=1&system_loss=0&angle=${tilt}&aspect=${azimuth}`;
                const response = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
                clearTimeout(timeout);
                if (!response.ok) throw new Error(`API error: ${response.status}`);
                const data = await response.json();
                if (!data.outputs?.hourly) throw new Error('Invalid API response');
                return data.outputs.hourly.map(val => val * totalPowerKw * SolarHybrid.config.SYSTEM_EFFICIENCY);
            } catch (e) { return null; }
        }
    },
    local: {
        calculateProfile: function(inputs) {
            const { lat, tilt, azimuth, date, totalPowerKw } = inputs;
            return calculateSolarOfflineProfile({ lat, tilt, azimuth, date, totalPowerKw });
        }
    },
    calculate: async function(inputs) {
        const { lat, lon, tilt, azimuth, date, time, totalPowerKw, dataMode } = inputs;
        let profile = null;
        let source = '';
        
        if (dataMode !== 'api') {
            profile = this.cache.get(lat, lon);
            if (profile) source = 'CACHE';
        }
        
        if (!profile && dataMode !== 'offline' && navigator.onLine) {
            this.updateStatus('🟡', 'Запит до PVGIS API...', 'api-loading');
            profile = await this.api.fetch(lat, lon, tilt, azimuth, totalPowerKw);
            if (profile) {
                this.cache.set(lat, lon, profile);
                source = 'API';
            }
        }
        
        if (!profile) {
            profile = this.local.calculateProfile({ lat, tilt, azimuth, date, totalPowerKw });
            source = 'OFFLINE';
        }
        
        const currentHour = new Date(`${date}T${time}`).getHours();
        const instantPower = profile[currentHour] || 0;
        const dailyEnergy = profile.reduce((sum, val) => sum + val, 0);
        
        let status = '';
        if (instantPower === 0) status = currentHour >= 6 && currentHour <= 20 ? '☁️ Хмарно / Ніч' : '🌙 Ніч';
        else if (instantPower < totalPowerKw * 1000 * 0.3) status = '🌤️ Слабке сонце';
        else status = '☀️ Заряджає АКБ';
        
        return { instantPower: Math.round(instantPower), dailyEnergy: Math.round(dailyEnergy), status, source, profile, currentHour };
    },
    updateStatus: function(icon, text, type) {
        const statusDiv = document.getElementById('solar_status');
        const iconSpan = document.getElementById('status_icon');
        const textSpan = document.getElementById('status_text');
        if(!statusDiv) return;
        statusDiv.style.display = 'block';
        iconSpan.textContent = icon;
        textSpan.textContent = text;
        const colors = { 'api': '#4CAF50', 'cache': '#FF9800', 'offline': '#2196F3', 'error': '#F44336', 'api-loading': '#9E9E9E' };
        iconSpan.style.color = colors[type] || '#fff';
    }
};

function openSolarCalculator() {
    const now = new Date();
    document.getElementById('solar_date').value = now.toISOString().split('T')[0];
    document.getElementById('solar_time').value = now.toTimeString().slice(0, 5);
    const lat = parseFloat(document.getElementById('solar_lat').value) || 49;
    document.getElementById('solar_tilt').value = lat;
    document.getElementById('solar_results').style.display = 'none';
    document.getElementById('solar_status').style.display = 'none';
    openModal('solarModal');
}

async function detectLocation() {
    if (!navigator.geolocation) { alert('📍 Геолокація не підтримується'); return; }
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🎯 Визначення...';
    btn.disabled = true;
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 3600000 });
        });
        document.getElementById('solar_lat').value = position.coords.latitude.toFixed(4);
        document.getElementById('solar_lon').value = position.coords.longitude.toFixed(4);
        document.getElementById('solar_tilt').value = position.coords.latitude.toFixed(1);
        SolarHybrid.updateStatus('🟢', `Локація: ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`, 'api');
    } catch (e) {
        alert('❌ Не вдалося визначити локацію: ' + e.message);
        SolarHybrid.updateStatus('🔴', 'Помилка геолокації', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function calculateSolar() {
    const inputs = {
        panelsCount: parseInt(document.getElementById('solar_panels_count').value) || 0,
        panelPower: parseInt(document.getElementById('solar_panel_power').value) || 0,
        lat: parseFloat(document.getElementById('solar_lat').value),
        lon: parseFloat(document.getElementById('solar_lon').value),
        date: document.getElementById('solar_date').value,
        time: document.getElementById('solar_time').value,
        tilt: parseFloat(document.getElementById('solar_tilt').value),
        azimuth: parseFloat(document.getElementById('solar_azimuth').value),
        dataMode: document.getElementById('solar_data_mode').value
    };

    // ВАЛІДАЦІЯ ДАТИ ТА ЧАСУ (окремо — бо це рядки)
    if (!inputs.date) return alert('Будь ласка, оберіть дату');
    if (!inputs.time) return alert('Будь ласка, вкажіть час');

    if (inputs.lat === 0 && inputs.lon === 0) {
        if (!confirm('⚠️ Ви ввели координати (0, 0) — це точка в Атлантичному океані.\nПродовжити розрахунок?')) return;
    }
    
    inputs.totalPowerKw = (inputs.panelsCount * inputs.panelPower) / 1000;
    document.getElementById('solar_loader').style.display = 'block';
    document.getElementById('solar_results').style.display = 'none';
    document.getElementById('solar_calc_btn').disabled = true;
    
    try {
        const result = await SolarHybrid.calculate(inputs);
        displaySolarResults(result, inputs);        
    } catch (e) {
        console.error('Solar calculation error:', e);
        SolarHybrid.updateStatus('🔴', 'Помилка розрахунку', 'error');
        alert('❌ Помилка: ' + e.message);
    } finally {
        document.getElementById('solar_loader').style.display = 'none';
        document.getElementById('solar_calc_btn').disabled = false;
    }
}

function displaySolarResults(result, inputs) {
    const statusMap = { 'API':['🟢', 'Онлайн (PVGIS)'], 'CACHE': ['🟠', 'Кеш (PVGIS)'], 'OFFLINE':['🔵', 'Офлайн (Формули)'] };
    const [icon, text] = statusMap[result.source] || ['⚪', 'Невідомо'];
    SolarHybrid.updateStatus(icon, text, result.source.toLowerCase());
    
    document.getElementById('res_instant_power').textContent = `${result.instantPower} W`;
    document.getElementById('res_daily_energy').textContent = `${result.dailyEnergy} Wh`;
    document.getElementById('res_status_text').textContent = result.status;
    document.getElementById('res_data_source').textContent = {
        'API': 'PVGIS API (живі дані)', 'CACHE': 'PVGIS API (кеш < 7 днів)', 'OFFLINE': 'Локальні астрономічні формули'
    }[result.source];
    
    drawSolarChart(result.profile, result.currentHour);
    document.getElementById('solar_results').style.display = 'block';
    window.solarLastResult = { ...result, ...inputs };
}

function drawSolarChart(profile, currentHour) {
    const canvas = document.getElementById('solar_chart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#1a1a1d';
    ctx.fillRect(0, 0, width, height);
    
    const maxPower = Math.max(...profile, 1);
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
    }
    
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    profile.forEach((value, hour) => {
        const x = padding + (chartWidth / 23) * hour;
        const y = padding + chartHeight - (value / maxPower) * chartHeight;
        if (hour === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
    ctx.fill();
    
    const currentX = padding + (chartWidth / 23) * currentHour;
    ctx.strokeStyle = '#ff9900';
    ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(currentX, padding); ctx.lineTo(currentX, padding + chartHeight); ctx.stroke();
    ctx.setLineDash([]);    
    
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';[0, 6, 12, 18, 23].forEach(hour => {
        const x = padding + (chartWidth / 23) * hour;
        ctx.fillText(`${hour}:00`, x, height - 10);
    });
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(padding, 10, 15, 3);
    ctx.fillStyle = '#ccc';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Виробітка (Вт)', padding + 20, 13);
}

function sendToSurvivalMode() {
    if (!window.solarLastResult) { alert('⚠️ Спочатку виконайте розрахунок сонячних панелей'); return; }
    const { instantPower } = window.solarLastResult;
    openSurvivalModeForm();
    alert(`✅ Дані передано в "Режим виживання"!\n\nДоступна потужність від сонця: ${instantPower} W\n\nВикористовуйте це значення для розрахунку допустимого навантаження.`);
}

function sendToRechargeMode() {
    if (!window.solarLastResult) { alert('⚠️ Спочатку виконайте розрахунок сонячних панелей'); return; }
    const { instantPower, dailyEnergy } = window.solarLastResult;
    openCalcRechargeForm();
    alert(`✅ Дані передано в "Регенерація"!\n\n🔋 Миттєва потужність: ${instantPower} W\n📊 Прогноз на день: ${dailyEnergy} Wh\n\nВикористовуйте для оцінки часу зарядки великих АКБ.`);
}

function handleAzimuthKeydown(event, input) {
    const key = event.key;
    const allowedKeys =['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '-', '−'];
    if ((key === '-' || key === '−') && input.selectionStart === 0) {
        if (!input.value.startsWith('-')) return true;
        event.preventDefault(); return false;
    }
    if ((key === '-' || key === '−') && input.selectionStart !== 0) {
        event.preventDefault(); return false;
    }
    if (!allowedKeys.includes(key) && !/^[0-9]$/.test(key)) {
        event.preventDefault(); return false;
    }
    return true;
}

function validateAzimuth(input) {
    let val = input.value.replace('−', '-').trim();
    val = val.replace(/(?!^)-/g, '').replace(/[^0-9\-]/g, '');
    let num = parseInt(val, 10);
    if (isNaN(num)) { input.value = '0'; return; }
    if (num < -180) num = -180;
    if (num > 180) num = 180;
    input.value = num.toString();
}
// ============================================================================
// 14. КОНВЕРТЕР ВЕЛИЧИН
// ============================================================================

function openAddDeviceForm() {
    const nameInput = document.getElementById('device_name');
    const mahInput = document.getElementById('device_mah');
    const wattsInput = document.getElementById('device_watts');
    if (nameInput) nameInput.value = '';
    if (mahInput) mahInput.value = '';
    if (wattsInput) wattsInput.value = '';
    openModal('addDeviceModal');
}

function toggleConverter() {
    const converter = document.getElementById('converter');
    converter.style.display = converter.style.display === 'block' ? 'none' : 'block';
}

function toggleConverterType() {
    const mainType = document.getElementById('conv_main_type').value;
    document.getElementById('physical_section').style.display = (mainType === 'physical' ? 'block' : 'none');
    document.getElementById('prefix_section').style.display = (mainType === 'prefix' ? 'block' : 'none');
    
    document.getElementById('physical_result').style.display = 'none';
    document.getElementById('prefix_result').style.display = 'none';
}

const physicalFormulas = {
    'P':[
        { formula: 'P = U × I', needs: ['U', 'I'], desc: 'Потужність через напругу та струм' },
        { formula: 'P = U² / R', needs: ['U', 'R'], desc: 'Потужність через напругу та опір' },
        { formula: 'P = I² × R', needs: ['I', 'R'], desc: 'Потужність через струм та опір' },
        { formula: 'P = A / t', needs: ['A', 't'], desc: 'Потужність через роботу та час' }
    ],
    'I':[
        { formula: 'I = P / U', needs: ['P', 'U'], desc: 'Струм через потужність та напругу' },
        { formula: 'I = U / R', needs: ['U', 'R'], desc: 'Струм через напругу та опір (Закон Ома)' },
        { formula: 'I = √(P / R)', needs: ['P', 'R'], desc: 'Струм через потужність та опір' }
    ],
    'U': [
        { formula: 'U = P / I', needs: ['P', 'I'], desc: 'Напруга через потужність та струм' },
        { formula: 'U = I × R', needs: ['I', 'R'], desc: 'Напруга через струм та опір (Закон Ома)' },
        { formula: 'U = √(P × R)', needs:['P', 'R'], desc: 'Напруга через потужність та опір' }
    ],
    'R': [
        { formula: 'R = U / I', needs: ['U', 'I'], desc: 'Опір через напругу та струм' },
        { formula: 'R = U² / P', needs: ['U', 'P'], desc: 'Опір через напругу та потужність' },
        { formula: 'R = P / I²', needs: ['P', 'I'], desc: 'Опір через потужність та струм' }
    ],
    'A':[
        { formula: 'A = P × t', needs: ['P', 't'], desc: 'Робота через потужність та час' },
        { formula: 'A = U × I × t', needs:['U', 'I', 't'], desc: 'Робота через напругу, струм та час' },
        { formula: 'A = I² × R × t', needs:['I', 'R', 't'], desc: 'Робота через струм, опір та час' }
    ],
    't': [
        { formula: 't = A / P', needs: ['A', 'P'], desc: 'Час через роботу та потужність' },
        { formula: 't = A / (U × I)', needs: ['A', 'U', 'I'], desc: 'Час через роботу, напругу та струм' }
    ],    
    'mAh':[
        { formula: 'mAh = Ah × 1000', needs: ['Ah'], desc: 'Міліампер-години через Ампер-години' }
    ],
    'Ah':[
        { formula: 'Ah = mAh / 1000', needs: ['mAh'], desc: 'Ампер-години через Міліампер-години' },
        { formula: 'Ah = Wh / V', needs:['Wh', 'V'], desc: 'Ампер-години через Ват-години та напругу' }
    ],
    'Wh':[
        { formula: 'Wh = Ah × V', needs: ['Ah', 'V'], desc: 'Ват-години через Ампер-години та напругу' },
        { formula: 'Wh = (mAh × V) / 1000', needs: ['mAh', 'V'], desc: 'Ват-години через Міліампер-години та напругу' },
        { formula: 'Wh = P × t', needs: ['P', 't'], desc: 'Ват-години через Потужність та час (год)' }
    ]
};

function showPhysicalFormulas() {
    const quantity = document.getElementById('physical_quantity').value;
    const formulasContainer = document.getElementById('formulas_container');
    const formulasList = document.getElementById('formulas_list');
    const inputsContainer = document.getElementById('physical_inputs');
    const resultDiv = document.getElementById('physical_result');
    
    if (!quantity) {
        formulasContainer.style.display = 'none';
        inputsContainer.style.display = 'none';
        resultDiv.style.display = 'none';
        return;
    }
    
    formulasContainer.style.display = 'block';
    const formulas = physicalFormulas[quantity];
    formulasList.innerHTML = formulas.map(f => 
        `<div class="formula-box">📐 ${f.formula}<br><small style="color: #888;">${f.desc}</small></div>`
    ).join('');
    
    const allParams = new Set();
    formulas.forEach(f => f.needs.forEach(p => allParams.add(p)));    
    
    inputsContainer.style.display = 'block';
    inputsContainer.innerHTML = '<label style="color: #ff9900; font-weight: bold; display: block; margin-bottom: 10px;">📝 Введіть відомі величини (заповніть хоча б 2 поля):</label>';
    
    allParams.forEach(param => {
        const paramLabels = {
            'P': 'Потужність P (W)',
            'I': 'Сила струму I (A)',
            'U': 'Напруга U (V)',
            'R': 'Опір R (Ω)',
            'A': 'Робота/Енергія A (J)',
            't': 'Час t (s)',
            'mAh': 'Ємність (mAh)',
            'Ah': 'Ємність (Ah)',
            'Wh': 'Енергія (Wh)',
            'V': 'Напруга V (V)'
        };
        
        inputsContainer.innerHTML += `
            <div class="input-group">
                <label>${paramLabels[param] || param}:</label>
                <input type="number" id="input_${param}" placeholder="Введіть ${param}" step="any">
            </div>
        `;
    });
    
    resultDiv.style.display = 'none';
}

function calculatePhysical() {
    const quantity = document.getElementById('physical_quantity').value;
    const formulas = physicalFormulas[quantity];
    const resultDiv = document.getElementById('physical_result');
    
    if (!quantity) {
        alert('Оберіть величину для розрахунку');
        return;
    }
    
    const inputData = {};['P', 'I', 'U', 'R', 'A', 't', 'mAh', 'Ah', 'Wh', 'V'].forEach(param => {
        const value = Number(document.getElementById(`input_${param}`)?.value);
        if (value && value > 0) {
            inputData[param] = value;
        }
    });
    
    let result = null;
    let usedFormula = null;
    
    for (const f of formulas) {
        const hasAllData = f.needs.every(param => inputData[param] !== undefined);
        if (hasAllData) {
            usedFormula = f;
            
            switch (quantity) {
                case 'P':
                    if (f.formula.includes('U × I')) result = inputData.U * inputData.I;
                    else if (f.formula.includes('U² / R')) result = Math.pow(inputData.U, 2) / inputData.R;
                    else if (f.formula.includes('I² × R')) result = Math.pow(inputData.I, 2) * inputData.R;
                    else if (f.formula.includes('A / t')) result = inputData.A / inputData.t;
                    break;
                case 'I':
                    if (f.formula.includes('P / U')) result = inputData.P / inputData.U;
                    else if (f.formula.includes('U / R')) result = inputData.U / inputData.R;
                    else if (f.formula.includes('√(P / R)')) result = Math.sqrt(inputData.P / inputData.R);
                    break;
                case 'U':
                    if (f.formula.includes('P / I')) result = inputData.P / inputData.I;
                    else if (f.formula.includes('I × R')) result = inputData.I * inputData.R;
                    else if (f.formula.includes('√(P × R)')) result = Math.sqrt(inputData.P * inputData.R);
                    break;
                case 'R':
                    if (f.formula.includes('U / I')) result = inputData.U / inputData.I;
                    else if (f.formula.includes('U² / P')) result = Math.pow(inputData.U, 2) / inputData.P;
                    else if (f.formula.includes('P / I²')) result = inputData.P / Math.pow(inputData.I, 2);
                    break;
                case 'A':
                    if (f.formula.includes('P × t')) result = inputData.P * inputData.t;
                    else if (f.formula.includes('U × I × t')) result = inputData.U * inputData.I * inputData.t;
                    else if (f.formula.includes('I² × R × t')) result = Math.pow(inputData.I, 2) * inputData.R * inputData.t;
                    break;
                case 't':
                    if (f.formula.includes('A / P')) result = inputData.A / inputData.P;
                    else if (f.formula.includes('A / (U × I)')) result = inputData.A / (inputData.U * inputData.I);
                    break;
                case 'mAh':
                    if (f.formula.includes('Ah × 1000')) result = inputData.Ah * 1000;
                    break;
                case 'Ah':
                    if (f.formula.includes('mAh / 1000')) result = inputData.mAh / 1000;
                    else if (f.formula.includes('Wh / V')) result = inputData.Wh / inputData.V;
                    break;
                case 'Wh':
                    if (f.formula.includes('Ah × V')) result = inputData.Ah * inputData.V;
                    else if (f.formula.includes('(mAh × V) / 1000')) result = (inputData.mAh * inputData.V) / 1000;
                    else if (f.formula.includes('P × t')) result = inputData.P * inputData.t / 3600;
                    break;
            }
            if (result !== null) break;
        }
    }
    
    if (result === null) {
        resultDiv.innerHTML = `<b style="color: #ff4444;">⚠️ Недостатньо даних!</b><br>Заповніть хоча б 2 поля для розрахунку.`;
        resultDiv.style.display = 'block';
        return;
    }
    
    const unitLabels = { 'P':'W', 'I':'A', 'U':'V', 'R':'Ω', 'A':'J', 't':'s', 'mAh':'mAh', 'Ah':'Ah', 'Wh':'Wh' };
    
    resultDiv.innerHTML = `
        <div class="result-box">
            <h4>✅ Результат розрахунку</h4>
            <div class="result-row">
                <span>Величина:</span>
                <b>${quantity} = ${result.toFixed(4)} ${unitLabels[quantity]}</b>
            </div>
            <div class="result-row">
                <span>Формула:</span>
                <b style="color: #ff9900;">${usedFormula.formula}</b>
            </div>
            <div class="result-row">
                <span>Опис:</span>
                <span style="color: #ccc;">${usedFormula.desc}</span>
            </div>
        </div>
    `;
    resultDiv.style.display = 'block';
}

function calculatePrefix() {
    const value = Number(document.getElementById('prefix_value').value);
    const direction = document.getElementById('prefix_direction').value;
    const unit = document.getElementById('prefix_unit').value;
    const resultDiv = document.getElementById('prefix_result');
    
    if (!value || value === 0) {
        alert('Введіть значення для конвертації');
        return;
    }
    
    let result = 0;
    let fromUnit = '';
    let toUnit = '';
    
    switch (direction) {
        case 'milli_to_base':
            result = value / 1000;
            fromUnit = `m${unit}`;
            toUnit = unit;
            break;
        case 'base_to_milli':
            result = value * 1000;
            fromUnit = unit;
            toUnit = `m${unit}`;
            break;
        case 'kilo_to_base':
            result = value * 1000;
            fromUnit = `k${unit}`;
            toUnit = unit;
            break;
        case 'base_to_kilo':
            result = value / 1000;
            fromUnit = unit;
            toUnit = `k${unit}`;
            break;
    }
    
    resultDiv.innerHTML = `
        <div class="result-box">
            <h4>✅ Результат конвертації</h4>
            <div class="result-row">
                <span>Вхідне значення:</span>
                <b>${value} ${fromUnit}</b>
            </div>
            <div class="result-row">
                <span>Результат:</span>
                <b style="color: #4CAF50;">${result.toFixed(6)} ${toUnit}</b>
            </div>
        </div>
    `;
    resultDiv.style.display = 'block';
}

function convertMah() {
    const mah = parseFloat(document.getElementById('conv_mah').value);
    if (isNaN(mah)) return;
    const ah = mah / 1000;
    document.getElementById('res_ah').innerText = ah.toFixed(3);
}

function convertWh() {
    const ah = parseFloat(document.getElementById('conv_ah').value);
    const v = parseFloat(document.getElementById('conv_v').value);
    if (isNaN(ah) || isNaN(v)) return;
    const wh = ah * v;
    document.getElementById('res_wh').innerText = wh.toFixed(2);
}

function convertW() {
    const amp = parseFloat(document.getElementById('conv_amp').value);
    const volt = parseFloat(document.getElementById('conv_volt').value);
    if (isNaN(amp) || isNaN(volt)) return;
    const w = amp * volt;
    document.getElementById('res_w').innerText = w.toFixed(2);
}

// ============================================================================
// 15. РОБОТА З ПАМ'ЯТТЮ (АРСЕНАЛ)
// ============================================================================
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// ============================================================================
// 16. УТИЛІТИ
// ============================================================================
function formatTime(totalMinutes) {
    if (totalMinutes <= 0 || isNaN(totalMinutes)) return "0 хв.";
    let h = Math.floor(totalMinutes / 60);
    let m = Math.round(totalMinutes % 60);
    return h > 0 ? `${h} год. ${m} хв.` : `${m} хв.`;
}

/**
 * Універсальна валідація полів.
 * @param {Array} fields - масив об'єктів { name, value, min, max, positive, optional }
 * @returns {Object} { ok: boolean, message: string }
 */
function validateFields(fields) {
    for (const f of fields) {
        const v = f.value;

        if (f.optional && (v === null || v === undefined || v === '' || isNaN(v))) {
            continue;
        }

        if (v === null || v === undefined || v === '' || isNaN(v)) {
            return { ok: false, message: `Будь ласка, заповніть поле: ${f.name}` };
        }

        const num = Number(v);

        if (f.positive && num <= 0) {
            return { ok: false, message: `${f.name} має бути додатнім числом` };
        }

        if (f.min !== undefined && num < f.min) {
            return { ok: false, message: `${f.name} має бути не менше ${f.min}` };
        }

        if (f.max !== undefined && num > f.max) {
            return { ok: false, message: `${f.name} має бути не більше ${f.max}` };
        }
    }
    return { ok: true };
}

// ============================================================================
// 17. ЗАВАНТАЖЕННЯ ЗВІТУ (заглушка)
// ============================================================================
function downloadReport() {
    alert("Функція завантаження звіту ще не реалізована.");
}

// ============================================================================
// 18. ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ
// ============================================================================
/*window.onload = function() {
    const wtCount = document.getElementById('worktime_count');
    if (wtCount) wtCount.addEventListener('input', updateConsumerFields);
    const csCount = document.getElementById('charge_stats_p4');
    if (csCount) csCount.addEventListener('input', updateChargeDeviceFields);
    const bkCount = document.getElementById('backup_count');
    if (bkCount) bkCount.addEventListener('input', updateBackupConsumerFields);
};

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('online', () => {
        if (document.getElementById('solarModal')?.style.display === 'block') {
            SolarHybrid.updateStatus('🟢', 'Інтернет відновлено', 'api');
        }
    });
    window.addEventListener('offline', () => {
        if (document.getElementById('solarModal')?.style.display === 'block') {
            SolarHybrid.updateStatus('🔵', 'Офлайн режим (формули)', 'offline');
            alert('📡 Інтернет відсутній. Розрахунок за середними даними.');
        }
    });
});
*/

// ============================================================================
// 19. ІНТЕГРАЦІЯ АРСЕНАЛУ З КАЛЬКУЛЯТОРАМИ (ВЕРСІЯ 2.0)
// ============================================================================

const ArsenalV2 = {
    getDevices: function() {
        let data = localStorage.getItem('arsenal_devices_v2');
        if (data) return JSON.parse(data);

        let oldData = localStorage.getItem('eng_tools_v4_data');
        if (oldData) {
            let parsed = JSON.parse(oldData);
            let migrated = parsed.map((d, i) => ({
                id: 'dev_' + Date.now() + '_' + i,
                name: d.name,
                capacity: d.mah ? Number(d.mah) : null,
                power: d.watts ? Number(d.watts) : null,
                voltage: 5,
                type: 'other'
            }));
            localStorage.setItem('arsenal_devices_v2', JSON.stringify(migrated));
            return migrated;
        }
        return[];
    },

    saveDevices: function(arr) {
        localStorage.setItem('arsenal_devices_v2', JSON.stringify(arr));
        renderDeviceListV2();
    },

    getIcon: function(type) {
        const icons = {
            'phone': '📱', 'laptop': '💻', 'powerbank': '🔋',
            'router': '📡', 'light': '💡', 'other': '🔌'
        };
        return icons[type] || '🔌';
    },

    renderSingle: function(containerId, targetType) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const devices = this.getDevices();
        if (devices.length === 0) {
            container.innerHTML = `<p style="color:#888; font-size:11px;">🎒 Додайте пристрої в Арсенал для швидкого вибору.</p>`;
            return;
        }

        let options = devices.map(d => 
            `<option value="${d.id}">${this.getIcon(d.type)} ${d.name} (${d.capacity ? d.capacity+'mAh' : d.power+'W'})</option>`
        ).join('');

        container.innerHTML = `
            <div class="arsenal-ui-box">
                <label class="arsenal-ui-title">🎒 Швидкий вибір з Арсеналу:</label>
                <div style="display:flex; gap:10px;">
                    <select id="${containerId}_select" onchange="ArsenalV2.applySingle('${containerId}', '${targetType}')" style="flex:1;">
                        <option value="">— Ввести вручну —</option>
                        ${options}
                    </select>
                    <button class="btn-form" onclick="ArsenalV2.clearSingle('${containerId}', '${targetType}')" style="padding: 8px; width:auto; font-size: 11px;">Очистити</button>
                </div>
            </div>
        `;
    },

    applySingle: function(containerId, targetType) {
        const select = document.getElementById(`${containerId}_select`);
        const deviceId = select.value;
        if (!deviceId) return this.clearSingle(containerId, targetType);

        const device = this.getDevices().find(d => d.id === deviceId);
        if (!device) return;

        if (targetType === 'btn1_pb') {
            document.getElementById('pb_know_capacity').value = 'mah';
            togglePbCapacityFields();
            if (device.capacity) document.getElementById('pb_mah').value = device.capacity;
            if (device.power) document.getElementById('pb_watts').value = device.power;
        } 
        else if (targetType === 'btn3_pb') {
            document.getElementById('know_wh').value = 'no';
            toggleWhFields();
            if (device.capacity) document.getElementById('worktime_mah').value = device.capacity;
            if (device.voltage) document.getElementById('worktime_v').value = device.voltage;
            if (device.power) document.getElementById('worktime_maxw').value = device.power;
        }
        else if (targetType === 'btn5_pb') {
            document.getElementById('know_pb_wh').value = 'no';
            togglePbWhFields();
            if (device.capacity) document.getElementById('charge_stats_mah').value = device.capacity;
        }
        else if (targetType === 'btn7_battery') {
            document.getElementById('survival_type').value = 'lithium';
            document.getElementById('survival_know_capacity').value = 'mah';
            toggleSurvivalCapacityFields();
            if (device.capacity) document.getElementById('survival_capacity_value').value = device.capacity;
        }
        else if (targetType === 'btn9_battery') {
            document.getElementById('backup_type').value = 'lifepo4';
            document.getElementById('backup_know_wh').value = 'no_mah';
            toggleBackupWhFields();
            if (device.capacity) document.getElementById('backup_mah').value = device.capacity;
        }
        else if (targetType === 'btn10_recharge') {
            document.getElementById('recharge_know_capacity').value = 'mah';
            toggleRechargeCapacityFields();
            if (device.capacity) document.getElementById('recharge_mah').value = device.capacity;
        }
    },

    clearSingle: function(containerId, targetType) {
        const select = document.getElementById(`${containerId}_select`);
        if (select) select.value = '';
        
        if (targetType === 'btn1_pb') {
            document.getElementById('pb_mah').value = '';
            document.getElementById('pb_watts').value = '';
        } else if (targetType === 'btn3_pb') {
            document.getElementById('worktime_mah').value = '';
            document.getElementById('worktime_v').value = '3.7';
            document.getElementById('worktime_maxw').value = '';
        } else if (targetType === 'btn5_pb') {
            document.getElementById('charge_stats_mah').value = '';
        } else if (targetType === 'btn7_battery') {
            document.getElementById('survival_capacity_value').value = '';
        } else if (targetType === 'btn9_battery') {
            document.getElementById('backup_mah').value = '';
        } else if (targetType === 'btn10_recharge') {
            document.getElementById('recharge_mah').value = '';
        }
    },

    renderMulti: function(containerId, targetBtn) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const devices = this.getDevices();
        if (devices.length === 0) {
            container.innerHTML = `<p style="color:#888; font-size:11px;">🎒 Додайте пристрої в Арсенал для швидкого вибору.</p>`;
            return;
        }

        let tags = devices.map(d => 
            `<span class="arsenal-tag" data-id="${d.id}" onclick="this.classList.toggle('selected')">
                ${this.getIcon(d.type)} ${d.name}
            </span>`
        ).join('');

        container.innerHTML = `
            <div class="arsenal-ui-box">
                <label class="arsenal-ui-title">🎒 Додати споживачів з Арсеналу:</label>
                <div class="arsenal-tags" id="${containerId}_tags">${tags}</div>
                <button class="btn-form" onclick="ArsenalV2.applyMulti('${containerId}', '${targetBtn}')" style="background:#4CAF50; padding:8px; font-size:12px; margin-top:5px;">
                    + Додати вибрані до розрахунку
                </button>
            </div>
        `;
    },

    applyMulti: function(containerId, targetBtn) {
        const tagsBox = document.getElementById(`${containerId}_tags`);
        const selectedTags = tagsBox.querySelectorAll('.arsenal-tag.selected');
        const devices = this.getDevices();
        
        if (selectedTags.length === 0) return alert('Оберіть принаймні один пристрій!');

        let selectedDevices = Array.from(selectedTags).map(tag => 
            devices.find(d => d.id === tag.dataset.id)
        ).filter(d => d);

        if (targetBtn === 'btn9_backup') {
            const countInput = document.getElementById('backup_count');
            let currentCount = Number(countInput.value) || 0;
            countInput.value = currentCount + selectedDevices.length;
            updateBackupConsumerFields();
            
            selectedDevices.forEach((dev, index) => {
                let targetId = currentCount + index + 1;
                let knowEl = document.getElementById(`backup_consumer_${targetId}_know`);
                if (knowEl) {
                    knowEl.value = 'w';
                    toggleBackupConsumerFields(targetId);
                    let wEl = document.getElementById(`backup_consumer_${targetId}_w`);
                    if (wEl) wEl.value = dev.power || ((dev.voltage || 5) * 1);
                }
            });
        }
        else if (targetBtn === 'btn5_chargestats') {
            const countInput = document.getElementById('charge_stats_p4');
            let currentCount = Number(countInput.value) || 0;
            countInput.value = currentCount + selectedDevices.length;
            updateChargeDeviceFields();
            
            selectedDevices.forEach((dev, index) => {
                let targetId = currentCount + index + 1;
                document.getElementById(`device_${targetId}_know_wh`).value = 'no';
                toggleDeviceWhFields(targetId);
                if (dev.capacity) document.getElementById(`device_${targetId}_mah`).value = dev.capacity;
                document.getElementById(`device_${targetId}_p`).value = 0;
            });
        }
        else if (targetBtn === 'btn3_consumers') {
            const countInput = document.getElementById('worktime_count');
            let currentCount = Number(countInput.value) || 0;
            countInput.value = currentCount + selectedDevices.length;
            updateConsumerFields();
            selectedDevices.forEach((dev, index) => {
                let targetId = currentCount + index + 1;
                let knowEl = document.getElementById(`consumer_${targetId}_know`);
                if (knowEl) {
                    if (dev.power) {
                        knowEl.value = 'yes';
                    } else {
                        knowEl.value = 'no';
                    }
                    toggleConsumerFields(targetId);
                }
                if (dev.power) {
                    let wEl = document.getElementById(`consumer_${targetId}_w`);
                    if (wEl) wEl.value = dev.power;
                } else {
                    let vEl = document.getElementById(`consumer_${targetId}_v`);
                    let aEl = document.getElementById(`consumer_${targetId}_a`);
                    if (vEl) vEl.value = dev.voltage || 5;
                    if (aEl) aEl.value = '';
                }
            });
        }

        selectedTags.forEach(t => t.classList.remove('selected'));
        const containerMap = {
            'btn9_backup': 'backup_consumers_container',
            'btn5_chargestats': 'charge_devices_container',
            'btn3_consumers': 'consumers_container'
        };
        const scrollToId = containerMap[targetBtn];
        if (scrollToId) document.getElementById(scrollToId).scrollIntoView({behavior: "smooth"});
    }
};

// -------------------------------------------------------------
// Перевизначаємо функції додавання і рендеру для головної сторінки
// -------------------------------------------------------------
function addDeviceToStorageV2() {
    let nameEl = document.getElementById('device_name');
    let mahEl = document.getElementById('device_mah');
    let wattsEl = document.getElementById('device_watts');
    let voltsEl = document.getElementById('device_voltage');
    let typeEl = document.getElementById('device_type');

    if (!nameEl) {
        console.error("Не знайдено поле device_name!");
        return;
    }

    let name = nameEl.value.trim();
    let mah = mahEl && mahEl.value ? Number(mahEl.value) : null;
    let watts = wattsEl && wattsEl.value ? Number(wattsEl.value) : null;
    let volts = voltsEl && voltsEl.value ? Number(voltsEl.value) : 5;
    let type = typeEl ? typeEl.value : 'other';

    if (!name) {
        alert("Введіть назву пристрою!");
        return;
    }

    let devices = ArsenalV2.getDevices();
    devices.push({
        id: 'dev_' + Date.now(),
        name: name,
        capacity: mah,
        power: watts,
        voltage: volts,
        type: type
    });
    
    ArsenalV2.saveDevices(devices);
    closeModal('addDeviceModal');
    
    ArsenalV2.renderSingle('arsenal_single_1', 'btn1_pb');
    ArsenalV2.renderSingle('arsenal_single_3', 'btn3_pb');
    ArsenalV2.renderSingle('arsenal_single_5_pb', 'btn5_pb');
    ArsenalV2.renderSingle('arsenal_single_7', 'btn7_battery');
    ArsenalV2.renderSingle('arsenal_single_9_battery', 'btn9_battery');
    ArsenalV2.renderSingle('arsenal_single_10', 'btn10_recharge');
    ArsenalV2.renderMulti('arsenal_multi_3', 'btn3_consumers');
    ArsenalV2.renderMulti('arsenal_multi_5', 'btn5_chargestats');
    ArsenalV2.renderMulti('arsenal_multi_9', 'btn9_backup');
    
    alert(`✅ ${name} успішно додано в Арсенал!`);
}

function renderDeviceListV2() {
    const listDiv = document.getElementById('deviceList');
    if (!listDiv) return;

    let devices = ArsenalV2.getDevices();
    if (devices.length === 0) {
        listDiv.innerHTML = "<span style='color:#888'>Арсенал порожній</span>";
        return;
    }

    listDiv.innerHTML = devices.map((d) => `
        <div class="device-item" style="border-bottom:1px solid #444; padding:8px 5px; display:flex; justify-content:space-between; align-items:center;">
            <span>${ArsenalV2.getIcon(d.type)} <b>${escapeHtml(d.name)}</b> 
                <span style="color:#888; font-size:11px;">(${d.capacity ? d.capacity+'mAh' : d.power+'W'})</span>
            </span>
            <span style="color:red; cursor:pointer; font-weight:bold; padding:0 5px;" onclick="deleteDeviceV2('${d.id}')">✕</span>
        </div>
    `).join('');
}

function deleteDeviceV2(id) {
    if (!confirm('Видалити цей пристрій з Арсеналу?')) return;
    let devices = ArsenalV2.getDevices().filter(d => d.id !== id);
    ArsenalV2.saveDevices(devices);
    
    ArsenalV2.renderSingle('arsenal_single_1', 'btn1_pb');
    ArsenalV2.renderSingle('arsenal_single_3', 'btn3_pb');
    ArsenalV2.renderSingle('arsenal_single_5_pb', 'btn5_pb');
    ArsenalV2.renderSingle('arsenal_single_7', 'btn7_battery');
    ArsenalV2.renderSingle('arsenal_single_9_battery', 'btn9_battery');
    ArsenalV2.renderSingle('arsenal_single_10', 'btn10_recharge');
    ArsenalV2.renderMulti('arsenal_multi_3', 'btn3_consumers');
    ArsenalV2.renderMulti('arsenal_multi_5', 'btn5_chargestats');
    ArsenalV2.renderMulti('arsenal_multi_9', 'btn9_backup');
}

// -------------------------------------------------------------
// Перехоплюємо відкриття модальних вікон для рендеру Арсеналу
// -------------------------------------------------------------

// Кнопка 1 – Powerbank
const origOpenCalcPowerbank = openCalcPowerbankForm;
openCalcPowerbankForm = function() {
    origOpenCalcPowerbank();
    ArsenalV2.renderSingle('arsenal_single_1', 'btn1_pb');
};

// Кнопка 3 – Work Time
const origOpenCalcWorkTime = openCalcWorkTimeForm;
openCalcWorkTimeForm = function() {
    origOpenCalcWorkTime();
    ArsenalV2.renderSingle('arsenal_single_3', 'btn3_pb');
    ArsenalV2.renderMulti('arsenal_multi_3', 'btn3_consumers');
};

// Кнопка 5 – Charge Stats
const origOpenCalcChargeStats = openCalcChargeStatsForm;
openCalcChargeStatsForm = function() {
    origOpenCalcChargeStats();
    ArsenalV2.renderSingle('arsenal_single_5_pb', 'btn5_pb');
    ArsenalV2.renderMulti('arsenal_multi_5', 'btn5_chargestats');
};

// Кнопка 7 – Survival Mode
const origOpenSurvivalMode = openSurvivalModeForm;
openSurvivalModeForm = function() {
    origOpenSurvivalMode();
    ArsenalV2.renderSingle('arsenal_single_7', 'btn7_battery');
};

// Кнопка 9 – Home Backup
const origOpenCalcHomeBackup = openCalcHomeBackupForm;
openCalcHomeBackupForm = function() {
    origOpenCalcHomeBackup();
    ArsenalV2.renderSingle('arsenal_single_9_battery', 'btn9_battery');
    ArsenalV2.renderMulti('arsenal_multi_9', 'btn9_backup');
};

// Кнопка 10 – Recharge
const origOpenCalcRecharge = openCalcRechargeForm;
openCalcRechargeForm = function() {
    origOpenCalcRecharge();
    ArsenalV2.renderSingle('arsenal_single_10', 'btn10_recharge');
};

// ============================================================================
// 20. ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ
// ============================================================================
window.onload = function() {
    renderDeviceListV2();
    initFlashlightCategories();

    const wtCount = document.getElementById('worktime_count');
    if (wtCount) wtCount.addEventListener('input', updateConsumerFields);
    const csCount = document.getElementById('charge_stats_p4');
    if (csCount) csCount.addEventListener('input', updateChargeDeviceFields);
    const bkCount = document.getElementById('backup_count');
    if (bkCount) bkCount.addEventListener('input', updateBackupConsumerFields);
};
