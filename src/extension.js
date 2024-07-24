"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }

    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

//Debouncing the function to avoid multiple calls
function debounce(func, wait){
    let timeout;
    return function(...args){
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// actual extension-code goes here
function startExtension(gmail) {
    console.log("Extension loading...");
    window.gmail = gmail;

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        console.log("Hello, " + userEmail + ". This is your extension talking!");

        //Debounced function for view_email event
        const debouncedViewEmail = debounce((domEmail) => {
            //console.log("Looking at email:", domEmail);
            const emailData = gmail.new.get.email_data(domEmail);
            addButtonInMail(emailData);
            //console.log("Email data:", emailData);
        }, 300);// 300ms debounce time, you can change it as per your requirement


        gmail.observe.on("view_email", (domEmail) => {
            debouncedViewEmail(domEmail);
        });

        gmail.observe.on("compose", (compose) => {
            console.log("New compose window is opened!", compose);
        });
        
    });
}

//Function to add button in the email
function addButtonInMail(emailData){
    const ButtonPosition = document.getElementsByClassName("G-atb D E")[1];
    ButtonPosition.style.height = '40px';

    if(ButtonPosition){
        //Butonu oluşturalım
        const button = document.createElement("button");
        button.innerText = "Spam Kontrol"; // Buton metni
        button.id = "mySpamButton"; // Buton ID'si

        //Butona özellikler ekleyelim (opsiyonel)
        button.style.backgroundColor = "#4CAF50"; // Arka plan rengi
        button.style.color = "white"; // Yazı rengi
        button.style.border = "none"; // Kenarlık
        button.style.padding = "10px 20px"; // İç boşluk
        button.style.marginLeft = "5px"; // Sol marj
        button.style.borderRadius = "5px"; // Kenar yuvarlaklığı
        button.style.cursor = "pointer"; // İmleç stilini pointer olarak ayarla
        button.style.zIndex = "999"; // Butonun z-index değeri en öne gelsin diye

        // Buton tıklandığında çalışacak işlemi belirleyelim
        button.addEventListener("click", () =>{
            mailParser(emailData);
        });

        // Butonu ekleme
        ButtonPosition.appendChild(button);
        console.log("Buton başarıyla eklendi maile");
    }
    else{
        console.log("Sorun var mail içeriğine buton eklenemedi.");
    }
}

function mailParser(emailData){
    const emailFrom = emailData.from;
    const emailTo = emailData.to;
    const emailSubject = emailData.subject;
    // bu var mı cidden? const emailBody = emailData.body;
    const emailContent = emailData.content_html

    console.log("Email From: ", emailFrom);
    console.log("Email To: ", emailTo);
    console.log("Email Subject: ", emailSubject);
    //bir iki satır boşluk olsun
    console.log("\n\n");
    console.log("Email Content: ", emailContent);

    dataSent(emailSubject, emailContent, emailFrom, emailTo);
}


function dataSent(subject, content, from, to){
    //API'ye gönderilecek veriler
    const data = {
        subject: subject,
        content: content,
        from: from,
        to: to
    };

    //API'ye post işlemi
    fetch('http://localhost:5000/check_spam2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        console.log("Veri başarıyla API'ye gönderildi.");
    }).catch(error => {
        console.error("Veri gönderilirken bir hata oluştu.");
    });
}