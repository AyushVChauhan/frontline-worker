let myEditor = null;
$(document).ready(function () {
    ClassicEditor.create(document.querySelector("#editor"))
        .then((newEditor) => {
            myEditor = newEditor;
        })
        .catch((error) => {
            console.error(error);
        });
    
});
function approve(e) {
    let data = myEditor.getData();
    Swal.fire({
        title: "Approve Worker?",
        text: "The worker will be provided with certificate",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, Approve",
        cancelButtonText: "No",
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: `/coordinator/approveCertificate/${$(e).data("id")}`,
                data: {data},
                success: function (response) {
                    window.open(response.url,"_self");
                }
            });
        }
    });
}
function reject(e) {
    let data = myEditor.getData();
    Swal.fire({
        title: "Reject Worker?",
        text: "The worker will be rejected for certificate",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, Reject",
        cancelButtonText: "No",
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: `/coordinator/rejectCertificate/${$(e).data("id")}`,
                data: {data},
                success: function (response) {
                    window.open(response.url,"_self");
                }
            });
        }
    });
}
