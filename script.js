const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const status = document.querySelector(".status");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn1 = document.querySelector("#copyURLBtn1");
const copyURLBtn2 = document.querySelector("#copyURLBtn2");
const fileURL1 = document.querySelector("#fileURL1");
const fileURL2 = document.querySelector("#fileURL2");
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const baseURL = "https://nshare-server.onrender.com";
// const baseURL = "http://localhost:3000";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100MB

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");

});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");

  console.log("drag ended");
});

// file input change and uploader
fileInput.addEventListener("change", () => {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value = ""; // reset the input
    return;
  }
  uploadFile();
});

// sharing container listeners
copyURLBtn1.addEventListener("click", () => {
  fileURL1.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});

copyURLBtn2.addEventListener("click", () => {
  fileURL2.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});

fileURL1.addEventListener("click", () => {
  fileURL1.select();
});

fileURL2.addEventListener("click", () => {
  fileURL2.select();
});

const uploadFile = () => {
  console.log("file added uploading");

  files = fileInput.files;
  const formData = new FormData();
  formData.append("myfile", files[0]);

  //show the uploader
  progressContainer.style.display = "block";

  // upload file
  const xhr = new XMLHttpRequest();

  // listen for upload progress
  xhr.upload.onprogress = function (event) {
    // find the percentage of uploaded
    let percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };

  // handle error
  xhr.upload.onerror = function () {
    showToast(`Error in upload: ${xhr.status}.`);
    fileInput.value = ""; // reset the input
  };

  // listen for response which will give the link
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      onFileUploadSuccess(xhr.responseText);
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const onFileUploadSuccess = (res) => {
  fileInput.value = ""; // reset the input
  status.innerText = "Uploaded";

  // remove the disabled attribute from form btn & make text send
  emailForm[2].removeAttribute("disabled");
  emailForm[2].innerText = "Send";
  progressContainer.style.display = "none"; // hide the box

  const { file1: url1, file2: url2 } = JSON.parse(res);
  console.log(url2);

  sharingContainer.style.display = "block";
  fileURL1.value = url1;
  fileURL2.value = url2;
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault(); // stop submission

  // disable the button
  emailForm[2].setAttribute("disabled", "true");
  emailForm[2].innerText = "Sending";

  const url = fileURL1.value;

  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    senderName: emailForm.elements["from-email"].value,
  };
  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Email Sent");
        sharingContainer.style.display = "none"; // hide the box
      }
    });
});

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};
