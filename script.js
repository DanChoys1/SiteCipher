window.onload = init

function init()
{
    // Изменение шифра
    var topMenuChilds = document.getElementById("topmenu").children
    for (let el of topMenuChilds) 
    {
        el.addEventListener("click", _ => changeCipherType(el.textContent))
    }

    // Генерация ключа
    let generateKeyBtn = document.getElementById("generate_key")
    generateKeyBtn.addEventListener("click", setGenerateKeyOnTexBox)

    // let keyTextBox = document.getElementById("key_box")
    // keyTextBox.setCustomValidity("Что-то не правильно")

    // Кодирование
    let cipherBtn = document.getElementById("ciph_btn")
    cipherBtn.addEventListener("click", _ => ciphText(false))
    
    let decipherBtn = document.getElementById("deciph_btn")
    decipherBtn.addEventListener("click", _ => ciphText(true))
}

function changeCipherType(name)
{
    let header = document.getElementById("cipher_name")
    header.textContent = name

    let shownAlghoritm = document.getElementsByClassName("show")[0]
    shownAlghoritm.className = "hide"
    let alghoritmManual = document.getElementById(name + "-alghoritm")
    alghoritmManual.className = "show"
}

function setGenerateKeyOnTexBox()
{
    let keyTextBox = document.getElementById("key_box")
    keyTextBox.value = generateKey()
}

function generateKey()
{
    let shownAlghoritm = document.getElementById("cipher_name").textContent
    let count = getAlgoKeyLenght(shownAlghoritm)
    
    let min = Math.pow(10, 16);
    let max = Math.pow(10, 17)
    let val = "";
    for(let i = 0; i < 10; ++i)
    {
        val += Math.floor(Math.random() * (max - min) + min).toString(36)
    }
    
    return val.slice(-count)
}

function getAlgoKeyLenght(name)
{
    let count = 0;
    switch (name)
    {
        case "AES":
            count = 128 //128/192/256 бит
            break
        case "BLOWFISH":
            count = 32 //от 32 до 448 бит
            break
        case "CAST":
            count = 64 //40-128 бит
            break
        case "DES":
            count = 64 //56 бит + 8 проверочных бит
            break
    }

    let v = count / 8
    return count/8
}

function ciphText(isDecipher)
{
    console.log(isDecipher)
    let keyText  = document.getElementById("key_box")
    let typeCiph = document.getElementById("cipher_name").textContent
    
    if (!checkKeyValidity(keyText.value, typeCiph))
    {
        keyText.setCustomValidity(`Ключ должен содержать ${getAlgoKeyLenght(typeCiph)} символов`);
        keyText.reportValidity()
        return
    } 

    let inText   = document.getElementById("in_text").value
    let outText  = document.getElementById("out_text")

    let req = 
    {
        isDeciph: isDecipher,
        type: typeCiph,
        text: inText,
        key:  keyText.value
    }
    
    fetch("/",
    {
        method:  'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body:    JSON.stringify(req)
    })
    .then(res => res.text())
    .then(text => outText.textContent = text)
}

function checkKeyValidity(key, ciphType)
{
    return key.length == getAlgoKeyLenght(ciphType)
}