new DataTable('#example');

function addSubject(){
    let subject=document.getElementById("recipient-name").value;
    console.log(subject);
    // let img=document.getElementById("img");
    
    var table = document.getElementById("example");
    // var newRow = table.insertRow(table.rows.length);

    // var cell1 = newRow.insertCell(0);
    // var cell12= newRow.insertCell(1);
    
    // cell1.innerHTML = "0";
    // cell12.innerHTML = subject;

    var table = $('#example').DataTable();
    table.row.add(["0", subject], img).draw();
}
function changeOrder(){
    let x=prompt("Sr No:")
    let y=prompt("Position:")

}