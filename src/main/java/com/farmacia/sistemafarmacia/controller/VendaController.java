package com.farmacia.sistemafarmacia.controller;

import com.farmacia.sistemafarmacia.model.Venda;
import com.farmacia.sistemafarmacia.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendas")
@CrossOrigin(origins = "*")
public class VendaController {

    @Autowired
    private VendaRepository repository;

    @GetMapping
    public List<Venda> listarVendas() {
        return repository.findAll();
    }
}