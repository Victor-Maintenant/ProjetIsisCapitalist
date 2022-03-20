/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.ISISCapitalist;

import generated.*;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.xml.bind.JAXBException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@Path("generic")
public class Webservices {
    
    Services services;

    public Webservices() {
        services = new Services();
    }

    @GET
    @Path("world")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public ResponseEntity<World> getWorld(@RequestHeader(value = "X-User", required = false) String username) throws JAXBException {
        World world = services.getWorld(username);
        return ResponseEntity.ok(world);
    }

    @PutMapping(value = "/product", consumes = {"application/xml", "application/json"})
    public ProductType putProduct(@RequestHeader(value = "X-User", required = false) String username, @RequestBody ProductType produit) throws JAXBException {
        services.updateProduct(username, produit);
        return produit;
    }

    @PutMapping(value = "/manager", consumes = {"application/xml", "application/json"})
    public PallierType putManager(@RequestHeader(value = "X-User", required = false) String username, @RequestBody PallierType manager) throws JAXBException {
        services.updateManager(username, manager);
        return manager;

    }

    @PutMapping(value = "/upgrade", consumes = {"application/xml", "application/json"})
    public PallierType putUpgrade(@RequestHeader(value = "X-User", required = false) String username, @RequestBody PallierType upgrade) throws JAXBException {
        services.updateUpgrade(username, upgrade);
        return upgrade;
    }

    @PutMapping(value = "/angel", consumes = {"application/xml", "application/json"})
    public PallierType putAngel(@RequestHeader(value = "X-User", required = false) String username, @RequestBody PallierType ange) throws JAXBException {
        services.updateAngel(username, ange);
        return ange;
    }

    @DeleteMapping(value = "world", consumes = {"application/xml", "application/json"})
    public ResponseEntity<World> DeleteWorld(@RequestHeader(value = "X-User", required = false) String username) throws JAXBException {
        World world = services.getWorld(username);
        services.deleteWorld(username);
        return ResponseEntity.ok(world);
    }
}
