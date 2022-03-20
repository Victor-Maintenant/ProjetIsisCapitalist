package com.example.ISISCapitalist;

import generated.*;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

/**
 *
 * @author Victor Maintenant
 */
public class Services {

    World readWorldFromXml(String username) throws JAXBException {
        World w = null;
        InputStream input = getClass().getClassLoader().getResourceAsStream(username + "-world.xml");
        if (input == null) {
            input = getClass().getClassLoader().getResourceAsStream("world.xml");
        }
        try {
            JAXBContext cont = JAXBContext.newInstance(World.class);
            Unmarshaller u = cont.createUnmarshaller();
            w = (World) u.unmarshal(input);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        return w;
    }
    
    void saveWorldToXml(World world, String pseudo) {
        try {
            OutputStream output = new FileOutputStream(new File("./src/main/resources/" + pseudo + "-world.xml"));
            JAXBContext cont = JAXBContext.newInstance(World.class);
            Marshaller m = cont.createMarshaller();
            m.marshal(world, output);
        } catch (FileNotFoundException | JAXBException e) {
            e.printStackTrace();
        }
    }
    
    public void deleteWorld(String username) throws JAXBException {
        World world = readWorldFromXml(username);
        double ange = world.getActiveangels();
        double totalAnge = world.getTotalangels();
        double score = world.getScore();
        
        double angeSup = Math.round(150 * Math.sqrt((world.getScore()) / Math.pow(10, 15))) - totalAnge;
        
        ange += ange + angeSup;
        totalAnge += ange + angeSup;
        
        JAXBContext cont = JAXBContext.newInstance(World.class);
        Unmarshaller u = cont.createUnmarshaller();
        InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
        world = (World) u.unmarshal(input);
        
        world.setActiveangels(ange);
        world.setTotalangels(totalAnge);
        world.setScore(0);

        // sauvegarder les changements du monde
        saveWorldToXml(world, username);
    }

    
    public Boolean updateProduct(String username, ProductType newproduct) throws JAXBException {
        World world = getWorld(username);
        ProductType product = findProductById(world, newproduct.getId());
        if (product == null) {
            return false;
        }
        int qtchange = newproduct.getQuantite() - product.getQuantite();
        if (qtchange > 0) {
            int newQuantite = newproduct.getQuantite();
            double argent = world.getMoney();
            double coutProd = product.getCout();
            double prix = coutProd * (1 - Math.pow(product.getCroissance(), qtchange)) / (1 - product.getCroissance());
            double newCout = coutProd * Math.pow(product.getCroissance(), qtchange);
            double newArgent = argent - prix; //a revoir
            product.setCout(newCout);
            product.setQuantite(newQuantite);
            world.setMoney(newArgent);
        } else {
            // initialiser product.timeleft à product.vitesse
            // pour lancer la production
            product.setTimeleft(product.getVitesse());
            world.setMoney(world.getMoney() + (product.getRevenu() * product.getQuantite()));
        }
        //Prise en compte des upgrades
        List<PallierType> unlocks = product.getPalliers().getPallier();
        for (PallierType u : unlocks) {
            if (product.getQuantite() >= u.getSeuil() && u.isUnlocked() == false) {
                calculUpgrade(u, product);
            }
        }
        // sauvegarder les changements du monde
        saveWorldToXml(world, username);
        return true;
    }
    
    World getWorld(String username) throws JAXBException {
        World world = readWorldFromXml(username);
        updateWorld(world);
        saveWorldToXml(world, username);
        return world;
    }
    
    
    public ProductType findProductById(World world, int id) {
        ProductType idProduit = null;
        for (ProductType produit : world.getProducts().getProduct()) {
            if (id == produit.getId()) {
                idProduit = produit;
            }
        }
        return idProduit;
    }//Jusqu'ici tout marche
    // prend en paramètre le pseudo du joueur et le manager acheté.
// renvoie false si l’action n’a pas pu être traitée

    public Boolean updateManager(String username, PallierType newmanager) throws JAXBException {
        // aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
        // trouver dans ce monde, le manager équivalent à celui passé
        // en paramètre
        PallierType manager = findManagerByName(world, newmanager.getName());
        if (manager == null) {
            System.out.println("manager non trouvé");
            return null;
        }

        // débloquer ce manager
        manager.setUnlocked(true);
        // trouver le produit correspondant au manager
        ProductType product = findProductById(world, manager.getIdcible());
        if (product == null) {
            return false;
        }
        // débloquer le manager de ce produit
        product.setManagerUnlocked(true);
        // soustraire de l'argent du joueur le cout du manager
        double argent = world.getMoney();
        double seuil = manager.getSeuil();
        double newArgent = argent - seuil;
        world.setMoney(newArgent);
        // sauvegarder les changements au monde
        saveWorldToXml(world, username);
        return true;
    }
    
    public PallierType findManagerByName(World world, String nom) {
        PallierType nomManager = null;
        for (PallierType nomMana : world.getManagers().getPallier()) {
            if (nom.equals(nomMana.getName())) {
                nomManager = nomMana;
            }
        }
        return nomManager;
    }
    
    void updateWorld(World world) {
        long tpsEcoule = System.currentTimeMillis() - world.getLastupdate();
        world.getProducts().getProduct().forEach((ProductType prod) -> {
            if (prod.getQuantite() > 0) {
                //System.out.println("tpsecoule " + tpsEcoule + " timeleft " + prod.getTimeleft());
                if (!prod.isManagerUnlocked() && prod.getTimeleft() != 0) {
                    System.out.println("manager pas unlock");
                    if (prod.getTimeleft() < tpsEcoule) {
                        world.setScore(world.getScore() + prod.getRevenu() * prod.getQuantite());
                        world.setMoney(world.getMoney() + prod.getRevenu() * prod.getQuantite());
                        prod.setTimeleft(0);
                    } else {
                        //prod pas encore finie, change timeleft
                        prod.setTimeleft(prod.getTimeleft() - tpsEcoule);
                    }
                } else if (prod.isManagerUnlocked()) {
                    //System.out.println("manager unlock");
                    int nbProd = (int) Math.floorDiv(tpsEcoule, prod.getVitesse());
                    world.setScore(world.getScore() + (prod.getRevenu() * prod.getQuantite()) * nbProd);
                    world.setMoney(world.getMoney() + (prod.getRevenu() * prod.getQuantite()) * nbProd);
                }
            }
        });
        world.setLastupdate(System.currentTimeMillis());
    }
    
    public Boolean updateUpgrade(String username, PallierType newupgrade) throws JAXBException {
        World world = getWorld(username);
        // trouver dans ce monde, le manager équivalent à celui passé
        // en paramètre
        PallierType upgrade = findUpgradeByName(world, newupgrade.getName());
        if (upgrade == null) {
            return false;
        }

        // débloquer ce manager
        upgrade.setUnlocked(true);
        // trouver le produit correspondant au manager
        ProductType product = findProductById(world, upgrade.getIdcible());
        if (product == null) {
            return false;
        }
        // soustraire de l'argent du joueur le cout du manager
        double argent = world.getMoney();
        double seuil = upgrade.getSeuil();
        double newArgent = argent - seuil;
        world.setMoney(newArgent);
        calculUpgrade(upgrade, product);
        // sauvegarder les changements au monde
        saveWorldToXml(world, username);
        return true;
    }
    
    public PallierType findUpgradeByName(World world, String nom) {
        PallierType nomUpgrade = null;
        for (PallierType nomUp : world.getUpgrades().getPallier()) {
            if (nom.equals(nomUp.getName())) {
                nomUpgrade = nomUp;
            }
        }
        return nomUpgrade;
    }
    
    public void calculUpgrade(PallierType u, ProductType product) {
        u.setUnlocked(true);
        if (u.getTyperatio() == TyperatioType.VITESSE) {
            int vitesse = product.getVitesse();
            double newVitesse = vitesse * u.getRatio();
            product.setVitesse((int) newVitesse);
        }
        if (u.getTyperatio() == TyperatioType.GAIN) {
            double revenu = product.getRevenu();
            double newRevenu = revenu * u.getRatio();
            product.setRevenu(newRevenu);
        }
        
    }
    
    public Boolean updateAngel(String username, PallierType angel) throws JAXBException {
        World world = getWorld(username);
        PallierType ange = findAngelByName(world, angel.getName());
        if (ange == null) {
            return false;
        }

        // débloquer cet ange
        ange.setUnlocked(true);
        double totalAnge = world.getTotalangels();
        int anges = ange.getSeuil();
        double newAnge = totalAnge - anges;
        if (ange.getTyperatio() == TyperatioType.ANGE) {
            int angeBonus = world.getAngelbonus();
            angeBonus += ange.getRatio();
            world.setAngelbonus(angeBonus);
            
        } else {
            updateUpgrade(username, ange);
            
        }
        world.setMoney(0);
        world.setScore(0);
        world.setActiveangels(newAnge);
        // sauvegarder les changements au monde
        saveWorldToXml(world, username);
        return true;
    }
    
    public PallierType findAngelByName(World world, String nom) {
        PallierType ange = null;
        for (PallierType nomAnge : world.getAngelupgrades().getPallier()) {
            if (nom.equals(nomAnge.getName())) {
                ange = nomAnge;
            }
        }
        return ange;
    }

}
