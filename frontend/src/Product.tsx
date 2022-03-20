import { Box } from "@mui/material"
import React, { useEffect, useRef } from "react"
import { useState } from "react"
import ProgressBar from "./ProgressBar"
import { Services } from "./Services"
import { World, Product } from "./World"

type ProductProps = {
    prod: Product
    services: Services
    onProductionDone: (product: Product) => void
    qtmulti: number
    world: World
    checkAllUnlocks: (seuil : number) => void
    onProductBuy: (cost: number, product:Product) => void
}


export default function ProductComponent({ prod, services, onProductionDone, qtmulti, world, checkAllUnlocks, onProductBuy }: ProductProps) {
    const [progress, setProgress] = useState(0);
    const savedCallback = useRef(calcScore);
    const [quantite, setQuantite] = useState(prod.quantite)
    const [cost, setCost] = useState(prod.cout)
    const [revenu, setR] = useState(prod.revenu);

    function startFabrication() {
        
            if (prod.quantite != 0) {
                prod.timeleft = prod.vitesse;
                prod.lastupdate = Date.now();
                prod.progressbarvalue = 0;
            }
        
    }

    useEffect(() => savedCallback.current = calcScore)
    useEffect(() => {
        let timer = setInterval(() => savedCallback.current(), 100)
        return function cleanup() {
            if (timer) clearInterval(timer)
        }
    }, [])

    let btnstate = true;
    let lblstate = true;
    let prix = 0;
    let mult = "";
    let n = qtmulti;
    if (prod.quantite == 0) {
        prix = prod.cout;
        if (prix > world.money) {
            btnstate = false;
            lblstate = false;
        }
        if (qtmulti > 1000) {
            n = calcMaxCanBuy();
            mult = ' le maximum possible ';
            if (n != 0) {
                prix = Math.round((prod.cout * (Math.pow(prod.croissance, n))) * 100) / 100;
            }
            else {
                btnstate = false;
                lblstate = false;
            }
        }
    }
    else {
        if (qtmulti > 1000) {
            n = calcMaxCanBuy();
            mult = ' le maximum possible ';
            if (n != 0) {
                prix = Math.round((prod.cout * (Math.pow(prod.croissance, n))) * 100) / 100;
            }
            else {
                btnstate = false;
                lblstate = false;
            }
        }
        else {
            prix = Math.round((prod.cout * (Math.pow(prod.croissance, n))) * 100) / 100;
            mult = "" + qtmulti + "";
            if (prix > world.money) {
                btnstate = false;
                lblstate = false;
            }
        }
    }

    let affichageprix = "Cout : " + prix + " €";
    let button;
    if (btnstate) {
        button = <button onClick={() => acheter()}>{affichageprix}</button>;
    }
    let label;
    if (lblstate) {
        label = <span>Achetez en {mult} pour : </span>
    }


    
    function calcScore() {
        let tpsEcoule: number;
        if (prod.timeleft != 0) {
            tpsEcoule = Date.now() - prod.lastupdate;
            prod.timeleft -= tpsEcoule;
            prod.lastupdate = Date.now();
            if (prod.timeleft <= 0) {
                if (prod.timeleft < 0) {
                    prod.timeleft = 0;
                    prod.progressbarvalue = 0;
                }
                onProductionDone(prod);
            } else {
                prod.progressbarvalue = Math.round(((prod.vitesse - prod.timeleft) / prod.vitesse) * 100)
            }
            setProgress(prod.progressbarvalue);
        } else {
            setProgress(0);
            if(prod.managerUnlocked){
                prod.timeleft = prod.vitesse;
                prod.lastupdate = Date.now();
                prod.progressbarvalue = 0;
            }
        }
    }

    function calcMaxCanBuy() {
        let n = 0;
        let prix = prod.cout;
        while (prix * prod.croissance <= world.money) {
            prix = prix * prod.croissance;
            n++;
            console.log(prod.name + "   " + prod.cout + "   " + prix + "    " + n)
        }
        return n;
    }

    function acheter() {
        prod.quantite += n;
        setQuantite(prod.quantite);
        prod.palliers.pallier.filter(echelon => !echelon.unlocked).map(unlock =>
            {
                if(unlock.seuil <= prod.quantite){
                if (!unlock.unlocked){
                    console.log("On débloque " + unlock.name);
                    console.log(unlock.typeratio);
                    unlock.unlocked = true;
                    if (unlock.typeratio=="VITESSE"){
                        prod.vitesse = prod.vitesse / unlock.ratio;
                        prod.progressbarvalue = prod.progressbarvalue / unlock.ratio;
                        prod.timeleft = prod.timeleft / 2;
                        setProgress(prod.progressbarvalue);
                        console.log("VITESSE de " + prod.name + " divisé par " + unlock.ratio);
                    }
                    else if (unlock.typeratio == "GAIN"){
                        prod.revenu = prod.revenu * unlock.ratio;
                        console.log("REVENU de " + prod.name + " multiplié par " + unlock.ratio);
                    }

                    checkAllUnlocks(unlock.seuil);
                }
            }}
        )
        let cost = prix;
        prod.cout = prod.cout*Math.pow(prod.croissance, n);
        prod.revenu += (prod.revenu * n ) /5;
        setR(prod.revenu);
        setCost(prod.cout);
        onProductBuy(cost, prod);
    }


    function checkForNewUpgrade(){
        world.upgrades.pallier.map(upgrade =>{
            if (upgrade.idcible == prod.id){
                if (upgrade.unlocked){
                    if (upgrade.typeratio == "VITESSE"){
                        prod.vitesse = prod.vitesse / upgrade.ratio
                        prod.progressbarvalue = prod.progressbarvalue / upgrade.ratio
                        prod.timeleft = prod.timeleft / upgrade.ratio
                        setProgress(prod.progressbarvalue)
                        upgrade.ratio = 1
                    }
                    else if (upgrade.typeratio == "GAIN"){
                        prod.revenu = prod.revenu * upgrade.ratio
                        console.log("REVENU de " + prod.name + " multiplié par " + upgrade.ratio)
                        upgrade.ratio = 1
                    }
                }
            }
            else if(upgrade.idcible ==0){
                if (upgrade.unlocked){
                world.products.product.map(p => {
                    if (upgrade.typeratio == "VITESSE") {
                        p.vitesse = p.vitesse / upgrade.ratio
                        p.progressbarvalue = p.progressbarvalue / upgrade.ratio
                        p.timeleft = p.timeleft / upgrade.ratio
                        setProgress(p.progressbarvalue)
                    } else if (upgrade.typeratio == "GAIN") {
                        p.revenu = p.revenu * upgrade.ratio
                        console.log("REVENU de " + prod.name + " multiplié par " + upgrade.ratio)
                    }
                })
                    upgrade.ratio = 1

                }
            }
        })
    }


    return (
        <div>
            <span>{prod.name}</span>
            <div><a href="#" onClick={startFabrication}><img src={services.server + prod.logo} id="imageProduit" /></a></div>
            <div><span>Quantité : {prod.quantite}</span></div>
            <div>{label}{button}</div>
            <div className="progressbar">
                <span>Temps restant : {prod.timeleft}</span>
                <ProgressBar transitionDuration={"0.1s"} customLabel={" "} completed={progress} />
                
            </div>
        </div>
    )
};



