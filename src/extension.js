"use strict";

import Swal from 'sweetalert2'
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
            console.log("DEBUG: Email data: ", emailData);
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
    const email_id = emailData.id;
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
    dataSent(email_id, emailSubject, emailContent, emailFrom, emailTo);
}


function dataSent(emailid, subject, content, from, to){
    //API'ye gönderilecek veriler
    const data = {
        email_id: emailid,
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
        console.log(data); //buraya mail id de gelmeli
        rightOuterİciDoldurma(emailid, content, data.is_spam);
    })
    .catch(error => {
      console.error('Hata:', error);
    });
}

function feedbackSent(mail_id, content, label, lang){
    //API'ye gönderilecek veriler
    label = !label; //!label olmasının sebebi bildirim yapıyor herifler yanlış olduğunu idda ettikleri için
    const data = {
        mail_id: mail_id,
        content: content,
        label: label,
        lang: lang
    };

    //API'ye post işlemi yapalım
    fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if(data.is_success){
            Swal.fire("Geri bildiriminiz için teşekkürler gelecekte düzeltilmek üzere değerlendirmeye alındı!", "", "success");
        }
        else{
            Swal.fire("Bu mail için zaten geri bildiriminizi yaptınız.", "", "error");
        }
    })
    .catch(error => {
      console.error('Hata:', error);
      Swal.fire("Bir hata oluştu. Lütfen tekrar deneyin.", "", "error");
    });

}

function DivEkleme(emailData) {
    // Yeni div oluşturma (outer most parent div)
    var mostOuterDiv = document.createElement("div");


    // custom-div-spam-detecter div'inin style'larını belirleme:
    mostOuterDiv.style.width = '100%';
    mostOuterDiv.style.height = '40px';
    mostOuterDiv.style.backgroundColor = '#ffffff';
    mostOuterDiv.style.display = 'flex';
    mostOuterDiv.style.alignItems = 'center';

    mostOuterDiv.className = "custom-div-spam-detecter";
    mostOuterDiv.id = "custom-div-spam-detect-id";

    // Buton oluşturma
    var kontrolBtn = btnOlusturucu("Spam Kontrol", "spam-kontrol-btn");

    // Butonlara tıklanınca çalışacak fonksiyonları belirleme
    kontrolBtn.addEventListener("click", () => {
        mailParser(emailData);
    });

    //left-outer-div ekleyelim ve style ayarlayalım
    var leftOuterDiv = document.createElement("div");
    leftOuterDiv.style.width = '15%';
    leftOuterDiv.style.height = '100%';
    leftOuterDiv.style.textAlign = 'center';
    leftOuterDiv.style.display = 'flex';
    leftOuterDiv.style.justifyContent = 'center';
    leftOuterDiv.style.alignItems = 'center';
    leftOuterDiv.className = "left-outer-div";

    //right-outer-div ekleyelim ve style ayarlayalım
    var rightOuterDiv = document.createElement("div");
    rightOuterDiv.style.width = '85%';
    rightOuterDiv.style.height = '100%';
    rightOuterDiv.style.textAlign = 'center';
    rightOuterDiv.style.display = 'flex';
    rightOuterDiv.style.justifyContent = 'center';
    rightOuterDiv.style.alignItems = 'center';
    rightOuterDiv.className = "right-outer-div";


    // parent div'e spam kontrol  butonu eklensin
    mostOuterDiv.appendChild(leftOuterDiv);
    mostOuterDiv.appendChild(rightOuterDiv);
    leftOuterDiv.appendChild(kontrolBtn);

    // Eklenecegimiz divin parent elementini bulalım
    var existingDiv = document.getElementsByClassName('nH a98 iY')[0];
    if(!existingDiv){
        console.log("DEBUG: Div bulunamadı ve eklenemedi. DivEkleme fonksiyonu başarısız.");
        return;
    }

    // Yeni div'i mevcut div'in altına ekleme (son sıraya)
    existingDiv.insertBefore(mostOuterDiv, existingDiv.firstChild);



    

    //eğer realtime switchi açıksa butona basmadan kontrol yapabilsin butonu da disable edelim
        // switchin durumunu alalım
        fetch('http://localhost:5000/switch')
        .then(response => response.json())
        .then(data => {
            if(data.state){
                kontrolBtn.disabled = true;
                kontrolBtn.style.backgroundColor = '#1abc9c';
                kontrolBtn.style.opacity = '0.5';
                //butonun üstüne gelince real time switch açık olduğu için kontrol yapabiliyor uyarısı
                kontrolBtn.title = "Real Time Spam Kontrol Zaten Açık Kullanılmasına Gerek Yok!";
                mailParser(emailData);
            }
        });

    console.log("DEBUG: outer most div eklenme işlemi başarılı.")

}

function rightOuterİciDoldurma(email_id, email_content, label){
    var innerLeftDiv = document.createElement("div");
    var innerRightDiv = document.createElement("div");

    innerLeftDiv.style.width = '82%';
    innerLeftDiv.style.height = '100%';
    if(label){
        innerLeftDiv.style.backgroundColor = 'red';
    } else {
        innerLeftDiv.style.backgroundColor = 'green';
    }
    innerLeftDiv.style.textAlign = 'center';
    innerLeftDiv.style.border = 'none';
    innerLeftDiv.style.borderRadius = '8px';
    innerLeftDiv.style.display = 'flex';
    innerLeftDiv.style.justifyContent = 'center';
    innerLeftDiv.style.alignItems = 'center';

    var text = document.createElement("p");
    
    if(label){
        text.innerText = "Bu bir spam e-postadır!";
    } else {
        text.innerText = "Bu bir spam e-posta değildir.";
    }

    text.style.color = 'white';

    innerLeftDiv.appendChild(text);

    //şimdi de inner right div ayarlayalım
    innerRightDiv.style.width = '18%';
    innerRightDiv.style.height = '100%';
    innerRightDiv.style.display = 'flex';
    innerRightDiv.style.justifyContent = 'center';
    innerRightDiv.style.alignItems = 'center';

    // Buton stilini doğrudan elementlere ekleme
    var bildirBtn = btnOlusturucu("Sonucu Bildir", "bildir-btn");

    // Butona tıklama
    bildirBtn.addEventListener("click", () => {
        Swal.fire({
            icon: "info",
            title: "Mail hakkında hangi dilde geri bildirim yapmak istersiniz?",
            text: "Eğer mail tespitinin yanlış olduğunu düşünüyorsanız mailin hangi dilde olduğunu belirten butona basıp geri bildirimde bulunabilirsiniz.",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "İngilizce",
            denyButtonText: `Türkçe`,
            cancelButtonText: "İptal",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                feedbackSent(email_id, email_content, label, "en"); 
                
            } else if (result.isDenied) {
                feedbackSent(email_id, email_content, label, "tr");
            }
          });
    });

    innerRightDiv.appendChild(bildirBtn);

    var existingDiv = document.getElementsByClassName('right-outer-div')[0];
    if(!existingDiv){
        console.log("DEBUG: Div bulunamadı ve eklenemedi. rightOuterİciDoldurma fonksiyonu başarısız.");
        return;
    }
    //parent div'in ikinci div child varsa eklemesin (aynı divi tekrar tekrar eklemesin)
    if(existingDiv.children.length > 1){
        console.log("DEBUG: rightOuterİciDoldurma ikinci defa çalışamadı zaten bir tane var.");
        return;
    }
    existingDiv.appendChild(innerLeftDiv);
    existingDiv.appendChild(innerRightDiv);
}

function btnOlusturucu(Text, ID){
    var btn = document.createElement("button");
    btn.innerText = Text;
    btn.id = ID;
    btn.className = "custom-button";


    //style ayarlayalım
    btn.style.padding = '10px 20px'; //iç boşluk
    btn.style.backgroundColor = '#17a589'; //arka plan rengi
    btn.style.color = 'white'; //yazı rengi
    btn.style.border = 'none'; //butonun kenarları
    btn.style.borderRadius = '8px'; //kenar yuvarlaklığı
    btn.style.cursor = 'pointer'; //imleç stilini pointer yapma
    btn.style.margin = 'auto'; //butonu ortala
    btn.style.height = '100%'; //butonun yüksekliği

    btn.addEventListener('mouseover', function () {
        this.style.backgroundColor = '#1abc9c';
    });
    btn.addEventListener('mouseout', function () {
        this.style.backgroundColor = '#17a589';
    });
    return btn;
}