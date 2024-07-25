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
    console.log("DEBUG: Extension loading...");
    window.gmail = gmail;

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        console.log("DEBUG: Hello, " + userEmail + ". This is your extension talking!");

        //Debounced function for view_email event
        const debouncedViewEmail = debounce((domEmail) => {
            console.log("DEBUG: Bir tane email içeriği açılıdı!(debounced function çalıştı)");
            //console.log("Looking at email:", domEmail);
            const emailData = gmail.new.get.email_data(domEmail);
            
            DivEkleme(emailData);
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

function mailParser(emailData){
    const emailFrom = emailData.from;
    const emailTo = emailData.to;
    const emailSubject = emailData.subject;
    // bu var mı cidden? const emailBody = emailData.body;
    const emailContent = emailData.content_html

    //console.log("Email From: ", emailFrom);
    //console.log("Email To: ", emailTo);
    //console.log("Email Subject: ", emailSubject);
    //bir iki satır boşluk olsun
    //console.log("\n\n");
    //console.log("Email Content: ", emailContent);
    console.log("DEBUG: Mail parser fonksiyonu çalıştı");
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

    //API'ye post işlemi yapalım
    fetch('http://localhost:5000/check_spam2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        rightDivEkle(data.is_spam);
    })
    .catch(error => {
      console.error('Hata:', error);
    });
}


function DivEkleme(emailData) {
    // Yeni div oluşturma (parent div)
    var newDiv = document.createElement("div");


    // parent div css özellikleri
    newDiv.style.width = '100%';
    newDiv.style.height = '40px';
    newDiv.style.backgroundColor = '#ffffff';
    newDiv.style.display = 'flex';
    newDiv.style.alignItems = 'center';

    newDiv.className = "custom-div-parent";
    newDiv.id = "custom-div-parent-id";

    // Buton oluşturma
    var button1 = document.createElement("button");
    button1.className = "custom-button";
    button1.innerText = "Spam Kontrol";
    button1.id = "spam-kontrol-btn";

    // Butonlara tıklanınca çalışacak fonksiyonları belirleme
    button1.addEventListener("click", () => {
        mailParser(emailData);
    });

    //left-div ekleyelim
    var leftDiv = document.createElement("div");
    leftDiv.style.width = '15%';
    leftDiv.style.height = '100%';
    leftDiv.style.display = 'flex';
    leftDiv.style.justifyContent = 'center';
    leftDiv.style.alignItems = 'center';



    // parent div'e spam kontrol  butonu eklensin
    newDiv.appendChild(leftDiv);
    leftDiv.appendChild(button1);

    // Eklenecegimiz divin parent elementini bulalım
    var existingDiv = document.getElementsByClassName('nH a98 iY')[0];
    if(!existingDiv){
        console.log("DEBUG: Div bulunamadı ve eklenemedi. DivEkleme fonksiyonu başarısız.");
        return;
    }

    // Yeni div'i mevcut div'in altına ekleme (son sıraya)
    existingDiv.insertBefore(newDiv, existingDiv.firstChild);

    // Buton stilini doğrudan elementlere ekleme
    var button1 = newDiv.getElementsByClassName("custom-button")[0];

    button1.style.padding = '10px 20px'; //iç boşluk
    button1.style.backgroundColor = '#17a589'; //arka plan rengi
    button1.style.color = 'white'; //yazı rengi
    button1.style.border = 'none'; //butonun kenarları
    button1.style.borderRadius = '8px'; //kenar yuvarlaklığı
    button1.style.cursor = 'pointer'; //imleç stilini pointer yapma
    button1.style.margin = 'auto'; //butonu ortala
    button1.style.height = '100%'; //butonun yüksekliği

    button1.addEventListener('mouseover', function () {
        this.style.backgroundColor = '#1abc9c';
    });
    button1.addEventListener('mouseout', function () {
        this.style.backgroundColor = '#17a589';
    });
    

    //eğer realtime switchi açıksa butona basmadan kontrol yapabilsin butonu da disable edelim
        // switchin durumunu alalım
        fetch('http://localhost:5000/switch')
        .then(response => response.json())
        .then(data => {
            if(data.state){
                button1.disabled = true;
                button1.style.backgroundColor = '#1abc9c';
                button1.style.opacity = '0.5';
                //butonun üstüne gelince real time switch açık olduğu için kontrol yapabiliyor uyarısı
                button1.title = "Real Time Spam Kontrol Zaten Açık Kullanılmasına Gerek Yok!";
                mailParser(emailData);
            }
        });

    console.log("DEBUG: div eklenme işlemi başarılı.")

}

function rightDivEkle(label){
    var rightDiv = document.createElement("div");
    rightDiv.style.width = '85%';
    rightDiv.style.height = '100%';
    if(label){
        rightDiv.style.backgroundColor = 'red';
    } else {
        rightDiv.style.backgroundColor = 'green';
    }
    rightDiv.style.textAlign = 'center';
    rightDiv.style.border = 'none';
    rightDiv.style.borderRadius = '8px';
    rightDiv.style.display = 'flex';
    rightDiv.style.justifyContent = 'center';
    rightDiv.style.alignItems = 'center';

    var text = document.createElement("p");
    
    if(label){
        text.innerText = "Bu bir spam e-postadır!";
    } else {
        text.innerText = "Bu bir spam e-posta değildir.";
    }

    text.style.color = 'white';

    rightDiv.appendChild(text);

    var existingDiv = document.getElementsByClassName('custom-div-parent')[0];
    if(!existingDiv){
        console.log("DEBUG: Div bulunamadı ve eklenemedi. rightDivEkle fonksiyonu başarısız.");
        return;
    }
    //parent div'in ikinci div child varsa eklemesin (aynı divi tekrar tekrar eklemesin)
    if(existingDiv.children.length > 1){
        console.log("DEBUG: Parent div'in ikinci div child'i olduğu için rightDiv eklenemedi.");
        return;
    }
    existingDiv.appendChild(rightDiv);
}