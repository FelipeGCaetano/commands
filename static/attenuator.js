async function saveInitialAttenuationState() {
    loadingAnimation(true)
    const baseUrl = "http://10.0.30.252:8000/attenuator"
    allDevicesSelected = checkIfAllDevicesIsSelected()

    if (!allDevicesSelected) {
        loadingAnimation(false)
        return alert('Você precisa selecionar todos os dispositivos')
    }

    const maintenanceInfo = getMaintenanceInfoFromForm()

    if (maintenanceInfo.error) {
        loadingAnimation(false)
        return alert(maintenanceInfo.message)
    }

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            'tabId': maintenanceInfo.tabId,
            'destinationGpon': maintenanceInfo.destinationGpon,
            'fileName': maintenanceInfo.fileName,
            'unchangedDevices': maintenanceInfo.idDevicesSelected
        })
    }

    let saveAttenuationState = await fetch(`${baseUrl}/save_initial_attenuation_state`, requestOptions)
    saveAttenuationState = await saveAttenuationState.json()

    if (saveAttenuationState.error) {
        messageError = saveAttenuationState.message
        return window.location = `${baseUrl}/render_error_page?message=${messageError}`
    }

    return window.location = `${baseUrl}/render_attenuations_page?tab_id=${maintenanceInfo.tabId}`
}

function getMaintenanceInfoFromForm() {
    const destinationHost = document.getElementById('select-olt').value
    const destinationSlot = document.getElementById('select-slot').value
    const destinationPort = document.getElementById('select-port').value
    const fileName = document.getElementById('file-name').value
    const tabId = getIdentificator()

    if (!destinationHost || !destinationSlot || !destinationPort) {
        return { error: true, message: 'Preecha o F/S/P para prosseguir'}
    } else if (!fileName) {
        return { error: true, message: 'Digite um nome para o seu arquivo para prosseguir'}
    }

    const gponInfo = {
        destinationGpon: {
            'host': destinationHost,
            'gpon': `0/${destinationSlot}/${destinationPort}`
        },
        fileName,
        tabId,
        idDevicesSelected: getIdDevicesSelected()
    }

    return gponInfo
}

function checkIfAllDevicesIsSelected()  {
    const allDevices = document.querySelectorAll('#cbx-single-item')
    let allSelected = true

    for (let device of allDevices) {
            if (!device.checked) {
            allSelected = false
            break
        }
    }
    return allSelected
}

async function showAttenuation(attenuationId) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            'tabId': getIdentificator()
        })
    }

    let allAttenuations = await fetch('http://10.0.30.252:8000/attenuator/get_onts_to_render', requestOptions)
    allAttenuations = await allAttenuations.json()
    ontsInAttenuation = getOntsInAttenuation(attenuationId, allAttenuations)

    if(ontsInAttenuation.length == 0) return alert('Ocorreu um problema ao buscar as atenuações')

    renderAttenuationPage(ontsInAttenuation, attenuationId)
}

function getOntsInAttenuation(attenuationId, allAttenuations) {
    const onts = []
    const unchangedOnts = JSON.parse(allAttenuations.unchanged_onts.replaceAll("'", '"'))
    const attenuations = allAttenuations.attenuations

    if (attenuationId == 0) {
        return unchangedOnts
    }

    attenuations.forEach((attenuation) => {
        if (attenuationId == attenuation.attenuation_id) {

            unchangedOnts.forEach((ont) => {
                const allIdsInAttenuation = attenuation.onts
                const ontId = ont.id.toString()

                if (allIdsInAttenuation.includes(ontId)){
                    onts.push(ont)
                }
            })
        }
    })

    return onts
}

function renderAttenuationPage(ontsInAttenuation, attenuationId) {
    const table = document.getElementById('onts-table')
    const containerTable = document.getElementById('container-onts-table')
    const attenuationsTable =document.getElementById('attenuations-table')

    containerTable.style.display = 'block'
    attenuationsTable.style.display = 'none'

    ontsInAttenuation.forEach((ont) => {
        const tr = document.createElement('tr')
        const idElement = document.createElement('td')
        const snElement = document.createElement('td')
        idElement.textContent = ont.id
        snElement.textContent = ont.sn

        tr.append(idElement, snElement)
        table.append(tr)
    })

    const holdButton = document.createElement('button')
    holdButton.textContent = 'Manter'
    holdButton.setAttribute('onclick', 'maintainAttenuation()')
    containerTable.appendChild(holdButton)

    if (attenuationId != 0) {
        const discardButton = document.createElement('button')
        discardButton.textContent = 'Descartar'
        discardButton.setAttribute('onclick', `discardAttenuation(${attenuationId})`)
        containerTable.appendChild(discardButton)
    }
}

async function discardAttenuation(attenuationId) {
    loadingAnimation(true)

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            'tabId': getIdentificator(),
            'attenuationId': attenuationId
        })
    }

    let discardSingleAttenuation = await fetch('http://10.0.30.252:8000/attenuator/discard_attenuation', requestOptions)
    discardSingleAttenuation = await discardSingleAttenuation.json()

    if (discardSingleAttenuation.error) {
        return alert('Ocorreu um erro ao remover a atenuação')
    }

    alert(`Atenuação ${attenuationId} removida com sucesso`)
    return window.location.reload()
}

function maintainAttenuation() {
    loadingAnimation(true)
    const tabId = getIdentificator()
    return window.location = `http://10.0.30.252:8000/attenuator/render_attenuations_page?tab_id=${tabId}`
}

function nextAttenuation() {
    loadingAnimation(true)
    const tabId = getIdentificator()
    return window.location = `http://10.0.30.252:8000/attenuator/next_attenuation?tab_id=${tabId}`
}

async function endAttenuation() {
    loadingAnimation(true)
    const tabId = getIdentificator()
    let endAttenuations = await fetch(`http://10.0.30.252:8000/attenuator/end_attenuations?tab_id=${tabId}`)
    endAttenuations = await endAttenuations.json()

    if (endAttenuations.error) {
        const messageError = endAttenuations.message
        return window.location = `http://10.0.30.252:8000/attenuator/render_error_page?message=${messageError}`
    }

    return window.location = `http://10.0.30.252:8000/attenuator/render_page_commands?tab_id=${tabId}`
}
