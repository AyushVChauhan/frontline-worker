let selectedQuestions = [];
let allQuestions = [];
// let allCos = [
//     { co: 1, count: 0 },
//     { co: 2, count: 0 },
//     { co: 3, count: 0 },
//     { co: 4, count: 0 },
//     { co: 5, count: 0 },
//     { co: 6, count: 0 },
//     { co: 7, count: 0 },
//     { co: 8, count: 0 },
//     { co: 9, count: 0 },
//     { co: 10, count: 0 },
// ];
let allModules = [];
moduleData.forEach((element) => {
    allModules.push({ module: element.moduleName, count: 0 });
});
// console.log(marks_questions);
let allMarks = [];
marks_questions.forEach((element) => {
    allMarks.push({ marks: element.marks, count: 0 });
});

function selectall() {
    let elements = document.getElementsByClassName("adder");
    let temp = [];
    let flag = 0;
    let markFlagCount = 0;
    allQuestions.forEach((element) => {
        let flag2 = 0;
        selectedQuestions.forEach((ele) => {
            // console.log(flag);
            if (ele._id == element._id) {
                flag++;
                flag2 = 1;
                return;
            }
        });
        if (flag2 == 0) {
            let markFlag = 0;
            allMarks.forEach((allmark) => {
                if (allmark.marks == element.marks) {
                    markFlag = 1;
                }
            });
            if (markFlag) {
                temp.push(element);
            } else {
                markFlagCount++;
            }
        }
    });
    // if(flag==0 && temp.length==0 && allQuestions.length>0)
    // console.log(flag +""+ allQuestions.length);
    if (flag == allQuestions.length) {
        allQuestions.forEach((ele) => {
            for (let index = 0; index < selectedQuestions.length; index++) {
                const element = selectedQuestions[index];
                if (ele._id == element._id) {
                    selectedQuestions.splice(index, 1);
                    index--;
                }
            }
        });
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            $(element).html(
                "<i class='fa-solid fa-plus text-success ms-4'></i>"
            );
        }
    } else {
        selectedQuestions.push(...temp);
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            let id = element.getAttribute("data-id");
            selectedQuestions.forEach((xyz) => {
                if (xyz._id == id) {
                    $(element).html(
                        "<i class='fa-solid fa-minus text-danger ms-4'></i>"
                    );
                    return;
                }
            });
        }
    }
    if (markFlagCount > 0) {
        Swal.fire({
            title: "Invalid Questions",
            text: `${markFlagCount} questions were not selected, ${temp.length} questions selected`,
            icon: "warning",
        });
    }
    // console.log(allQuestions.length + "" + selectedQuestions.length);
    // if(selectedQuestions.length == allQuestions.length)
    // {
    //     for (let index = 0; index < elements.length; index++) {
    //         const element = elements[index];
    //         $(element).html("<i class='fa-solid fa-minus text-danger ms-4'></i>")
    //     }
    //     selectedQuestions = [];
    // }
    // else
    // {
    //     console.log("hi");
    //     selectedQuestions = allQuestions;
    //
    // }
    renderCos($("#marksORco").val());
}
function adder(e) {
    let id = e.getAttribute("data-id");
    let flag = 0;
    selectedQuestions.forEach((ele, ind) => {
        if (ele._id == id) {
            flag = 1;
            selectedQuestions.splice(ind, 1);
            return;
        }
    });
    if (flag) {
        e.innerHTML = "<i class='fa-solid fa-plus text-success ms-4'></i>";
    }
    if (!flag) {
        allQuestions.forEach((ele) => {
            if (ele._id == id) {
                let markFlag = 0;
                allMarks.forEach((element) => {
                    if (ele.marks == element.marks) {
                        markFlag = 1;
                        return;
                    }
                });
                if (markFlag) {
                    selectedQuestions.push(ele);
                    e.innerHTML =
                        "<i class='fa-solid fa-minus text-danger ms-4'></i>";
                } else {
                    Swal.fire({
                        title: "Invalid Question",
                        text: "Marks does not match with previously selected data",
                        icon: "error",
                    });
                }
            }
        });
    }
    renderCos($("#marksORco").val());
}

function renderCos(val) {
    allModules = [];
    moduleData.forEach((element) => {
        allModules.push({ module: element.moduleName, count: 0 });
    });
    allMarks = [];
    marks_questions.forEach((element) => {
        allMarks.push({ marks: element.marks, count: 0 });
    });
    if (val == "module") {
        allModules.forEach((ele) => {
            for (let index = 0; index < selectedQuestions.length; index++) {
                const element = selectedQuestions[index];
                if (element.topicId[0].moduleId.moduleName == ele.module) {
                    ele.count++;
                }
            }
        });
        let body = ``;
        allModules.forEach((ele,index) => {
            if (ele.count > 0) {
                body += `<div class="accordion-item"><h2 class="accordion-header"><button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#CO${index}"
                        aria-expanded="false"
                        aria-controls="CO${index}"
                    >
                        ${ele.module} -- ${ele.count}
                    </button>
                </h2>
                <div
                    id="CO${index}"
                    class="accordion-collapse collapse hide"
                    data-bs-parent="#coDiv"
                >
                    <div class="accordion-body"><ol>`;
                selectedQuestions.forEach((element) => {
                    if (element.topicId[0].moduleId.moduleName == ele.module) {
                        body += `<li>${element.question}</li>`;
                    }
                });
                body += "</ol></div></div></div>";
            }
        });
        $("#coDiv").html(body);
    } else {
        allMarks.forEach((ele) => {
            for (let index = 0; index < selectedQuestions.length; index++) {
                const element = selectedQuestions[index];
                if (element.marks == ele.marks) {
                    ele.count++;
                }
            }
        });
        let body = ``;
        allMarks.forEach((ele) => {
            if (ele.count > 0) {
                body += `<div class="accordion-item"><h2 class="accordion-header"><button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#CO${ele.marks}"
                        aria-expanded="true"
                        aria-controls="CO${ele.marks}"
                    >
                        Marks-${ele.marks} -- ${ele.count}
                    </button>
                </h2>
                <div
                    id="CO${ele.marks}"
                    class="accordion-collapse collapse show"
                    data-bs-parent="#coDiv"
                >
                    <div class="accordion-body"><ol>`;
                selectedQuestions.forEach((element) => {
                    if (element.marks == ele.marks) {
                        body += `<li>${element.question}</li>`;
                    }
                });
                body += "</ol></div></div></div>";
            }
        });
        $("#coDiv").html(body);
    }
    // console.log(body);
}

function seer(e) {
    let id = e.getAttribute("data-id");
    $.ajax({
        type: "POST",
        url: "/coordinator/questionDetail",
        data: { id },
        success: function (response) {
            // console.log(response);
            let data = response.questionDetail;
            let subnameqdetail = null;
            let moduleDetail = null;
            let topicqdetail = [];

            data.topicId.forEach((element) => {
                moduleDetail = element.moduleId.moduleName;
                topicqdetail.push(element.topic);
                subnameqdetail = element.moduleId.subjectId.name;
            });
            // console.log(data);
            let typeqdetail = null;
            let difficultyqdetail = null;
            if (data.type == 1) {
                typeqdetail = "MCQ";
            }
            if (data.type == 2) {
                typeqdetail = "One Word";
            }
            if (data.type == 3) {
                typeqdetail = "Descriptive";
            }
            if (data.difficulty == 1) {
                difficultyqdetail = "Easy";
            }
            if (data.difficulty == 2) {
                difficultyqdetail = "Medium";
            }
            if (data.difficulty == 3) {
                difficultyqdetail = "Hard";
            }
            let html =
                "<div class='question'><div class='modalQuestion me-2'><h4><b>Question :</b></h4></div><div class='modalQuestion'> " +
                data.question +
                `</div></div>`;

            if (data.type == 1) {
                html +=
                    " <div class='row' ><div class='modalQuestion col-auto'><h4><b>Option :</b></h4></div><div class='modalQuestion col'><ol style='list-style-type: upper-alpha;font-size:20px'>";

                data.options.forEach((element) => {
                    if (element.option == data.answer)
                        html +=
                            "<li style='color:green;'>" +
                            element.option +
                            "</li>";
                    else html += "<li>" + element.option + "</li>";
                });
                html += "</ol></div>";
            }

            html +=
                "<div><div class='modalQuestion me-2'><h4><b>Answer :</b></h4></div><div class='modalQuestion' style='color:green; font-size: 20px '> " +
                data.answer +
                "</b></div></div></div><div><div class='modalQuestion me-2'><h4><b>Marks :</b></h4></div><div class='modalQuestion'> " +
                data.marks +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Type :</b></h4></div><div class='modalQuestion'> " +
                typeqdetail +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Difficulty:</b></h4></div><div class='modalQuestion'> " +
                difficultyqdetail +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Subject:</b></h4></div><div class='modalQuestion'> " +
                subnameqdetail +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Module : </b></h4></div><div class='modalQuestion'> " +
                moduleDetail +
                "</div></div></div><div class='row'><div class='modalQuestion col-auto'><h4><b>Topic :</b></h4></div><div class='modalQuestion col'><ul> ";
            topicqdetail.forEach((ele) => {
                html += `<li>${ele}</li>`;
            });
            html +=
                "</ul></div></div></div><div><div class='modalQuestion me-2'><h4><b>Time required(in Seconds) :</b></h4></div><div class='modalQuestion'>" +
                data.time_required;
            html +=
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Created By :</b></h4></div><div class='modalQuestion'>" +
                data.created_by.username +
                "</div></div></div>";
            $(".modal-body").html(html);
            // $('#largeModal').modal('show');
            $("#questionDetailModal").modal("show");
        },
    });
}
function plusMinus() {
    let elements = document.getElementsByClassName("adder");
    // console.log(elements.length);
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        let id = element.getAttribute("data-id");
        // console.log(id);
        selectedQuestions.forEach((ele) => {
            // console.log(ele._id+""+id);
            if (ele._id == id) {
                element.innerHTML =
                    "<i class='fa-solid fa-minus text-danger ms-4'></i>";
                return;
            }
        });
    }
}
$("#generateDataTable").click(() => {
    let type = $("#typeselect").val();
    let difficulty = $("#difficultyselect").val();
    let createdby = $("#createdbyselect").val();
    let module = $("#moduleselect").val();
    let mark = $("#markselect").val();
    let topic = $("#topicselect").val();

    // console.log("hi");
    $.ajax({
        type: "POST",
        url: "/coordinator/getQuestion",
        data: { subject, type, difficulty, createdby, module, mark, topic },
        success: function (response) {
            if (response.length !== 0) {
                let questions = response.questionData;
                // questions.forEach((ele)=>{console.log(ele.course_outcome_id)})
                let def =
                    "<table class='uk-table uk-table-hover uk-table-striped text-center' id='datatable'><thead><th>Sr No.</th><th>Type</th><th>Subject</th><th>Question</th><th>Action</th></thead>";
                let data = "";
                let type1 = null;
                let subject1 = null;
                let ind = 1;
                allQuestions = [];
                questions.forEach((ele) => {
                    // console.log(ele);
                    if (ele.topicId[0].moduleId != 0) {
                        allQuestions.push(ele);
                        // console.log("hii");
                    }
                });
                generateDataTable();
            }
        },
    });

    $("#filterModal").modal("hide");
});
function generateDataTable() {
    let arr = $("#fields").val();
    let def =
        "<table class='uk-table uk-table-hover uk-table-striped text-center' id='datatable'><thead><th>Sr No.</th>";

    if (arr.includes("type")) {
        def += "<th>Type</th>";
    }
    if (arr.includes("subject")) {
        def += "<th>Subject</th>";
    }
    if (arr.includes("question")) {
        def += "<th>Question</th>";
    }
    if (arr.includes("mark")) {
        def += "<th>Mark</th>";
    }
    if (arr.includes("module")) {
        def += "<th>Module</th>";
    }
    if (arr.includes("difficulty")) {
        def += "<th>Difficulty</th>";
    }
    if (arr.includes("createdby")) {
        def += "<th>Created By</th>";
    }
    def += "<th>Action</th>";
    def += "</thead>";
    let data = "";
    let type1 = null;
    let subject1 = null;
    let ind = 1;
    allQuestions.forEach((ele) => {
        if (ele.type == 1) {
            type1 = "MCQ";
        }
        if (ele.type == 2) {
            type1 = "ONE WORD";
        }
        if (ele.type == 3) {
            type1 = "DESCRIPTIVE";
        }
        data += "<tr>";
        // SRNO
        data += `<td>${ind++}</td>`;

        if (arr.includes("type")) {
            data += `<td>${type1}</td>`;
        }

        if (arr.includes("subject")) {
            let subject1 = ele.topicId[0].moduleId.subjectId.name;
            data += `<td>${subject1}</td>`;
        }

        if (arr.includes("question")) {
            data += `<td class="add-read-more show-less-content">${ele.question}</td>`;
        }

        if (arr.includes("mark")) {
            data += `<td>${ele.marks}</td>`;
        }

        if (arr.includes("module")) {
            data += `<td>${ele.topicId[0].moduleId.moduleName}</td>`;
        }

        if (arr.includes("difficulty")) {
            let diff =
                ele.difficulty == "1"
                    ? "Easy"
                    : ele.difficulty == "2"
                    ? "Medium"
                    : "Hard";
            data += `<td>${diff}</td>`;
        }
        if (arr.includes("createdby")) {
            data += `<td>${ele.created_by.username}</td>`;
        }

        data += `<td><a data-id='${ele._id}' onclick='seer(this)' class='see' ><i class='fa-solid fa-eye text-dark'></i></a><a data-id='${ele._id}' onclick='adder(this)' class='adder' ><i class='fa-solid fa-plus ms-4 text-success' ></i></a></td>`;
        data += "</tr>";
    });
    $("#tableDiv").html(def + data + "</table>");
    var myTable;

    myTable = $("#datatable").DataTable({
        pagingType: "simple_numbers",
        language: {
            paginate: {
                previous: "<",
                next: ">",
            },
        },
    });
    myTable.on("page.dt", () => {
    plusMinus();
        
    });
    $("#datatable_paginate").append(
        "<button class='btn btn-success rounded-pill' style='position:relative;top:-40px' onclick='selectall()' ><i class='fa-solid fa-plus' style='color:white'></i>&nbsp;Select All</button>"
    );

    // abc();
    plusMinus();
}
$(document).ready(function () {
    $("#fields").select2({
        placeholder: "placeholder",
        multiple: true,
    });
    $("#fields").val(["type", "question"]).trigger("change");
    $("#fields").on("change", generateDataTable);
    $("#generateDataTable").trigger("click");
});
function nextPage() {
    let alertMarks = "";
    allMarks.forEach((ele) => {
        for (let index = 0; index < selectedQuestions.length; index++) {
            const element = selectedQuestions[index];
            if (element.marks == ele.marks) {
                ele.count++;
            }
        }
    });
    allMarks.forEach((ele) => {
        marks_questions.forEach((element) => {
            if (ele.marks == element.marks) {
                if (ele.count < element.count) {
                    alertMarks += `${element.count - ele.count} questions of ${
                        ele.marks
                    } marks, `;
                }
            }
        });
    });
    if (alertMarks.length > 1) {
        Swal.fire({
            title: "Required Questions",
            text: alertMarks.substring(0, alertMarks.length - 2),
            icon: "warning",
        });
    } else {
        // console.log(selectedQuestions);
        let mySelectedQuestions = selectedQuestions.map((ele) => {
            return { marks: ele.marks, _id: ele._id };
        });
        // console.log(mySelectedQuestions);
        $.ajax({
            type: "POST",
            url: "/coordinator/addQuiz/setQuestions",
            data: { selectedQuestions: mySelectedQuestions },
            success: function (response) {
                if (response.next_page) {
                    window.open(
                        "/coordinator/addQuiz/setCompulsaryQuestions",
                        "_self"
                    );
                } else {
                    // Swal.fire({icon:"success",text:"Quiz created Successfully"});
                    window.open("/coordinator", "_self");
                }
            },
        });
    }
}
