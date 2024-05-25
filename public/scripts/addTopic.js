let count = 2;
let options = [];
let editor;
let filesData = "";
let divData = [];
divData.push({ id: 1, html: $("#files").html(), rendered: true });
// fOR CREATING CKEDITOR
ClassicEditor.create(document.querySelector("#editor"))
    .then((newEditor) => {
        editor = newEditor;
    })
    .catch((error) => {
        console.error(error);
    });
function descChange() {
    let flag = 0;
    divData.forEach((ele) => {
        if (
            document.getElementById(`questionDesc${ele.id}`).value.length ==
                0 &&
            document.getElementById(`questionFile${ele.id}`).files.length == 0
        ) {
            flag = ele.id;
            return;
        }
    });
    if (flag != 0) {
        removeFile(document.getElementById("fileButton" + flag));
    }

    filesData = "";
    let temp = 0;
    for (let index = 0; index < divData.length; index++) {
        const element = divData[index];
        if (index % 2 == 0 && index != 0) {
            filesData += "</div>";
            temp--;
        }
        if (index % 2 == 0) {
            filesData += "<div class='row'>";
            temp++;
        }
        filesData += "<div class='col'>";
        let descValue = document.getElementById(
            `questionDesc${element.id}`
        ).value;
        if (descValue.length == 0) descValue = index + 1;
        filesData += descValue;
        filesData += "</div>";
    }
    if (temp == 1) filesData += "</div>";

    filesData += "</div>";
    $("#resourcesPreview").html(filesData);
}
function renderFileDiv() {
    let innerHTML = "";
    divData.forEach((ele) => {
        if (!ele.rendered) {
            innerHTML += ele.html;
            ele.rendered = true;
        }
    });
    $("#files").append(innerHTML);
}
// FOR DISABLING ADD BUTTON ON EMPTY VALUE
function removeFile(e) {
    let id = e.getAttribute("data-id");
    console.log(divData);
    for (let index = 0; index < divData.length; index++) {
        const element = divData[index];
        if (element.id == id) {
            divData.splice(index, 1);
            break;
        }
    }
    console.log(divData);
    document.getElementById(`inputGroup${id}`).remove();
	descChange()
}
function addFile() {
    let flag = 1;
    divData.forEach((ele) => {
        if (
            document.getElementById(`questionDesc${ele.id}`).value.length ==
                0 ||
            document.getElementById(`questionFile${ele.id}`).files.length == 0
        ) {
            flag = 0;
            return;
        }
    });
    if (flag) {
        let curr_id =
            divData.length === 0 ? 0 : divData[divData.length - 1].id + 1;
        let innerHTML = `<div class="input-group" id="inputGroup${curr_id}"><input class="form-control" type="text" name="" id="questionDesc${curr_id}" placeholder="Description" oninput='descChange()'>
        <input
            type="file"
            class="form-control"
            id="questionFile${curr_id}"
            name="question"
            onchange="fileChange(this)"
        />
        <button data-id="${curr_id}" class="btn btn-danger" id="fileButton${curr_id}" onclick="removeFile(this)"><i class="fa-solid fa-xmark"></i></button></div>`;
        divData.push({ id: curr_id, html: innerHTML, rendered: false });
        renderFileDiv();
    }
}
function fileChange(e) {
}

function addLink() {
	let linksElements = document.getElementsByClassName("links");
	let flag = 1;
	for (let index = 0; index < linksElements.length; index++) {
		const element = linksElements[index];
		if(!element.value)
		{
			flag = 0;
		}
	}
	if(flag)
	{
		$("#linksDiv").append(`<input oninput="renderLinks()" type="text" class="form-control links" required />`)
	}
	renderLinks()
}
function renderLinks() {
	let linksElements = document.getElementsByClassName("links");
	let links = "";
	for (let index = 0; index < linksElements.length; index++) {
		const element = linksElements[index];
		links += element.value + "<br>";
	}
	$("#linksPreview").html(links);
}



$("#reset").on("click", function () {
	location.reload(); 
});

function addTopic() {
	let moduleId = document.getElementById("moduleId").value;
	let topic = document.getElementById("topicName").value;
	let content = editor.getData();
	let formData = new FormData();
	formData.append("moduleId", moduleId)
	formData.append("topic", topic)
	formData.append("content", content)
	divData.forEach((ele)=>{
		let myFile = document.getElementById(
			`questionFile${ele.id}`
		).files[0];
		let myName = document.getElementById(
			`questionDesc${ele.id}`
		).value;
		formData.append("resources",myFile);
		formData.append("resourcesNames[]", myName);
	})
	let linksElements = document.getElementsByClassName("links");
	for (let index = 0; index < linksElements.length; index++) {
		const element = linksElements[index];
		formData.append("links",element.value);
	}
	$.ajax({
		type: "post",
		url: "/coordinator/addTopic",
		data: formData,
		processData:false,
		contentType:false,
		success: function (response) {
			if(response.success == 1){
				Swal.fire("Topic Added Successfully", "", "success");
			}
		}
	});
}

//      ********            For showing option(marks,ans,option)        *******
$(document).ready(function () {
    // FOR SHOWING QUESTION PREVIEW
    editor.model.document.on("change", () => {
        $("#contentPreview").html(editor.getData());
    });
});
