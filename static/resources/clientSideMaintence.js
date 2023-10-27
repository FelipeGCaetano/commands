async function getBoardsHost(){
    const host = document.getElementById('select-olt').value
    let hostSlots = await fetch(`https://nmt.nmultifibra.com.br/files/hosts?olt=${host}`)
    hostSlots = await hostSlots.json()

    if (hostSlots.message == 'Host not Found'){
        return alert(`Ocorreu um erro aos buscar as informações da ${host} no NMT`)
    }

    fillElementsOptions(hostSlots)
    setIdentificator()
}

function fillElementsOptions(slots){
    const slotSelectElement = document.getElementById('select-slot')
    const portSelectElement = document.getElementById('select-port')
    let counterPorts = 0

    slots.forEach(slot => {
        const optionPortElement = document.createElement('option')
        const currentPortValue = slot.split('/')[1]
        optionPortElement.textContent = currentPortValue
        slotSelectElement.append(optionPortElement)
    })

    while(counterPorts < 16){
        const optionPortElement = document.createElement('option')
        optionPortElement.textContent = counterPorts
        portSelectElement.append(optionPortElement)
        counterPorts++
    }
}

function setIdentificator(){
    const identificatorTab = Date.now()
    window.sessionStorage.setItem('tabId', identificatorTab)
}

async function searchOnts(){
    const sourceHost = document.getElementById('select-olt').value
    const sourceSlot = document.getElementById('select-slot').value
    const sourcePort = document.getElementById('select-port').value
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value
    const tabId = getIdentificator()
    const sourcePonLocation = `0/${sourceSlot}/${sourcePort}`
    const sourceGpon = {
        'host':  sourceHost,
        'gpon': sourcePonLocation
    }
    
    if(!sourceHost || !sourceSlot || !sourcePort) return alert("ATENÇÃO: Preencha o F/S/P!")

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            tabId,
            sourceGpon
        })
    }

    const ontsRequest = await fetch('http://localhost:8000/generator/search_onts', requestOptions)
    const responsOfontsRequest = await ontsRequest.json()
    
    if(responsOfontsRequest.error == true){
        const message = responsOfontsRequest.message
        return window.location = `http://localhost:8000/generator/render_error_page?message=${message}`
    }

    return window.location = `http://localhost:8000/generator/render_onts_table?tab_id=${tabId}` 
}

function getIdentificator(){
    const identificatorTab = window.sessionStorage.getItem('tabId')
    return identificatorTab
}

function selectAllDevices(){
    const checkboxSelectAll = document.getElementById('cbx-select-all')
    const checkboxesSingleItems = document.querySelectorAll('#cbx-single-item')

    checkboxesSingleItems.forEach((singleCheckbox) => {
        if (checkboxSelectAll.checked){
            singleCheckbox.checked = true
        } else {
            singleCheckbox.checked = false
        }
    })
}

async function generateCommands(){
    const allDevices = document.querySelectorAll('#cbx-single-item')
    const devicesSelecteds = []

    if (allDevices.length == 0) return alert('Selecione ao menos um dispositivo')

    allDevices.forEach((device) => {
        console.log(device.parentNode)
    })

}