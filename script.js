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

    let keyTextBox = document.getElementById("key_box")
    // keyTextBox.setCustomValidity("Что-то не правильно")

    // Кодирование
    let cipherBtn = document.getElementById("ciph_btn")
    cipherBtn.addEventListener("click", ciphText)
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
    let shownAlghoritm = document.getElementsByClassName("show")[0].id
    let count = 0
    switch (shownAlghoritm)
    {
        case "DES-alghoritm":
            count = 5
            break
        case "AUR-alghoritm":
            count = 10
            break
    }

    return Math.random().toString(36).slice(count)
}

function ciphText()
{
    let user = 
    {
        name: 'John',
        surname: 'Smith'
    };

    fetch("/", 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(user)
    })
    .then(response => response.text())
    .then(commits => console.log(commits));
}