let panier=[];
let total=0;
let reduction10=false;

const panierDiv=document.getElementById("panier");
const liste=document.getElementById("liste");
const totalSpan=document.getElementById("total");

document.getElementById("btn-panier").onclick=()=>panierDiv.classList.add("open");
document.getElementById("fermer").onclick=()=>panierDiv.classList.remove("open");

function ajouter(nom,prix,img){
    const exist = panier.find(p => p.nom === nom);
    if(exist){
        exist.quantite +=1;
        total += prix;
    } else {
        panier.push({nom, prix, img, quantite:1});
        total += prix;
    }
    afficher();
}

function afficher(){
    liste.innerHTML="";
    panier.forEach((p,i)=>{
        liste.innerHTML += `
        <div class="panier-item">
            <img src="${p.img}" width="50" height="50">
            <span>${p.nom}</span>
            <input type="number" min="1" value="${p.quantite}" onchange="changerQuantite(${i},this.value)">
            <span>${(p.prix*p.quantite).toFixed(2)} €</span>
            <button onclick="supprimer(${i})">X</button>
        </div>`;
    });
    totalSpan.textContent=total.toFixed(2);
}

function changerQuantite(i,q){
    q=parseInt(q);
    if(q<1) q=1;
    total -= panier[i].prix*panier[i].quantite;
    panier[i].quantite=q;
    total += panier[i].prix*panier[i].quantite;
    afficher();
}

function supprimer(i){ total-=panier[i].prix*panier[i].quantite; panier.splice(i,1); afficher(); }

function acheter(nom,prix,img){ ajouter(nom,prix,img); document.getElementById("catalogue").classList.add("hidden"); document.getElementById("compte").classList.remove("hidden"); window.scrollTo({top:0,behavior:'smooth'}); }

function creerCompte(e){
    e.preventDefault();
    const nom=document.getElementById("newNom").value;
    const email=document.getElementById("newEmail").value;
    const pass=document.getElementById("newPass").value;
    if(localStorage.getItem(email)){ alert("Compte déjà existant, connectez-vous !"); return; }
    localStorage.setItem(email,JSON.stringify({nom,pass}));
    alert("Compte créé ! 10% de réduction appliquée.");
    reduction10=true;
    document.getElementById("compte").classList.add("hidden");
    document.getElementById("coordonnees").classList.remove("hidden");
}

function connexion(e){
    e.preventDefault();
    const email=document.getElementById("loginEmail").value;
    const pass=document.getElementById("loginPass").value;
    const user=localStorage.getItem(email);
    if(!user){ alert("Aucun compte trouvé. Créez un compte !"); return; }
    const data=JSON.parse(user);
    if(data.pass!==pass){ alert("Mot de passe incorrect !"); return; }
    alert("Connexion réussie !");
    reduction10=false;
    document.getElementById("compte").classList.add("hidden");
    document.getElementById("coordonnees").classList.remove("hidden");
}

function confirmerCommande(e){
    e.preventDefault();
    if(reduction10){ total=total*0.9; alert("10% de réduction appliquée ! Total réduit : "+total.toFixed(2)+" €"); }
    alert("Commande confirmée ! Procédez au paiement via PayPal ci-dessous.");
    document.getElementById("coordonnees").classList.add("hidden");
    document.getElementById("catalogue").classList.remove("hidden");
    renderPaypal();
}

document.getElementById("facture").onclick=()=>{
    const { jsPDF }=window.jspdf;
    const pdf=new jsPDF();
    pdf.text("FACTURE - Boutique Luxe",20,20);
    let y=40;
    panier.forEach(p=>{ pdf.text(`${p.nom} - ${p.quantite} x ${p.prix}€ = ${(p.prix*p.quantite).toFixed(2)}€`,20,y); y+=10; });
    pdf.text(`TOTAL : ${total.toFixed(2)}€`,20,y+10);
    pdf.save("facture.pdf");
};

document.getElementById("confirmer-panier").onclick=()=>{
    document.getElementById("panier").classList.remove("open");
    document.getElementById("compte").classList.remove("hidden");
    window.scrollTo({top:0,behavior:'smooth'});
};

function renderPaypal(){
    document.getElementById("paypal").innerHTML="";
    paypal.Buttons({
        style:{layout:'vertical', color:'gold', shape:'rect', label:'pay'},
        createOrder:function(data,actions){ return actions.order.create({purchase_units:[{amount:{value:total.toFixed(2)}}]}); },
        onApprove:function(data,actions){ return actions.order.capture().then(function(details){ alert("Paiement effectué ! Argent reçu sur votre PayPal."); panier=[]; total=0; afficher(); document.getElementById("paypal").innerHTML=""; }); }
    }).render("#paypal");
}

let index=0;
setInterval(()=>{ const slides=document.querySelectorAll(".slide"); slides.forEach(s=>s.classList.remove("active")); slides[index].classList.add("active"); index=(index+1)%slides.length; },5000);

document.getElementById("toggleTheme").onclick=()=>{ document.body.classList.toggle("light"); };

const faders=document.querySelectorAll(".fade-scroll");
window.addEventListener("scroll",()=>{ const triggerBottom=window.innerHeight/5*4; faders.forEach((f,i)=>{ const top=f.getBoundingClientRect().top; if(top<triggerBottom){ setTimeout(()=>{ f.classList.add("visible"); },i*100); } }); });

document.querySelectorAll(".link-slide").forEach(link=>{
    link.addEventListener("click",e=>{
        e.preventDefault();
        const target=document.getElementById(link.getAttribute("href"));
        target.scrollIntoView({behavior:"smooth"});
    });
});
