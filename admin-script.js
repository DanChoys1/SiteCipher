window.onload = init

var dates = {};

async function init()
{
    //заолняем dates
    await initDates();
    //заполняем таблицу
    initTable();

    let changeDateRange = document.getElementById("changeDateRange")
    changeDateRange.addEventListener("click", _ => range(changeDateRange.value))
}

function initTable()
{
    let table = document.getElementById("frTable");
    let range = document.getElementById("changeDateRange");

    for (let algo in dates)
    {
        let newRow = table.insertRow(-1);
        let newCell = newRow.insertCell(0);
        newCell.innerHTML=algo;        
        let newCell2 = newRow.insertCell(1);
        newCell2.innerHTML=dates[algo][range.value];
    }
}

function range(val)
{
    let table = document.getElementById("frTable");
    let cells = table.getElementsByTagName("td");

    let i = 1;
    for (let algo in dates)
    {
        cells[i].innerText = dates[algo][val];
        i+=2;
    }
}

async function initDates()
{
    await fetch("/admin-dates",
    {
        method:  'POST',
    })
    .then(res => res.json())
    .then(j => dates = j);
}