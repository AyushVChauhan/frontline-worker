

let alltopics = [];
let selectedTopics = [];
function nextPage() {
    if(selectedTopics.length > 0)
    {
        $.ajax({
            type: "POST",
            url: "/coordinator/addQuestion/setTopics",
            data: {selectedTopics:selectedTopics},
            success: function (response) {
                location.href = "http://localhost:3000/coordinator/addQuestion/question"
            }
        });
    }
    else
    {
        Swal.fire({text:"Atleast Select One Topic",icon:"warning",timer:2000})
    }
}
function adder(e) {
    // let a = document.getElementById("abc");
    let id = e.getAttribute("data-id");
    alltopics.forEach(ele => {
        if (ele["_id"] === id) {
            flag = 1;
            for (let index = 0; index < selectedTopics.length; index++) {
                const element = selectedTopics[index];
                if (element["_id"] === id) {
                    flag = 0;
                    selectedTopics.splice(index, 1);
                    let eles = document.getElementsByClassName('adder');
                    for (let index = 0; index < eles.length; index++) {
                        const element = eles[index];
                        if (element.getAttribute("data-id") === id) {
                            element.innerHTML = "<i class='fa-solid fa-plus'/>"
                        }
                    }
                }
            }
            if (flag === 1) {
                selectedTopics.push(ele);
                let eles = document.getElementsByClassName('adder');
                for (let index = 0; index < eles.length; index++) {
                    const element = eles[index];
                    if (element.getAttribute("data-id") === id) {
                        element.innerHTML = "<i class='fa-solid fa-minus'/>"
                    }
                }

            }
            selectedTable();
        }
    })
}
function selectedTable() {
    let def = `<h2>Selected Topics</h2><table class="table table-hover"  >`;
    let data = `<tr>
    <th style="width:90px">SR NO.</th><th>TOPIC</th><th>Module</td></tr>`;

    selectedTopics.forEach((ele,ind) => {
        data += `<tr><td class="text-secondary" style="width:90px">${ind+1}</td><td class="text-secondary">${ele.topic}</td><td class="text-secondary">${ele.moduleId.moduleName}</td></tr> `;
    })
    $("#selectedTableDiv").html(def + data + "</table>");
    // var myTable;

    // myTable = $("#datatable1").DataTable({
    //     pagingType: "simple_numbers",
    //     language: {
    //         paginate: {
    //             previous: "<",
    //             next: ">",
    //         },
    //     },
    // });

}
$(function () {

    $("#subject").select2();
    $("#coSelect").select2();

    $("#subject").change(() => {
        selectedTopics = [];
        $("#selectedTableDiv").html("");
        $("#tableDiv").html("");
        // console.log(this.value);
        let data = document.getElementById("subject").value;
        if (data === "0") {
            $("#coSelect").html("");
            $("#coSelect").select2();
            return;
        }    
        $.ajax({
            type: "POST",
            url: "/coordinator/getModules",
            data: {subjectId:data},
            success: function (response) {
                if(response.success == 1)
                {
                    let cos = "";
                    response.modules.forEach(ele=>{
                        cos += `<option value='${ele._id}'>${ele.moduleName}</option>`;
                    })
                    $("#coSelect").prop("disabled", false);
                    $("#coSelect").html(cos);
                    $("#coSelect").select2();
                }
                else{
                    Swal.fire("Invalid Subject","The subject you chose was Invalid","error");
                }
            }
        });
    
       
    });




    $("#getTopicButton").click(() => {
        let module = $("#coSelect").val();
        $.ajax({
            type: "POST",
            url: "/coordinator/addQuestion/getTopics",
            data: { module: module },
            success: function (response) {
                if (response.length !== 0) {
                    alltopics = response;
                    selectedTopics = [];
                    let def = "<table class='uk-table uk-table-hover uk-table-striped text-center' id='datatable'><thead><th>Sr No.</th><th>Topic</th><th>Module</th><th>Actions</th></thead>";
                    let data = "";

                    response.forEach((ele, ind) => {
                        data += "<tr>";
                        data += `<td>${ind + 1}</td>`;
                        data += `<td>${ele.topic}</td>`;
                        data += `<td>${ele.moduleId.moduleName}</td>`;
                        data += `<td><a data-id='${ele._id}' onclick='adder(this)' class='adder' ><i class='fa-solid fa-plus'/></a></td>`;
                        data += "</tr>";
                    })
                    $("#tableDiv").html(def + data + "</table>");
                    var myTable;

                    myTable = $("#datatable").DataTable({
                        pagingType: "simple_numbers",
                        scrollCollapse: true,
                        language: {
                            paginate: {
                                previous: "<",
                                next: ">",
                            },
                        },
                    });
                }
            }
        });
    });


});