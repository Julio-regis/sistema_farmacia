package com.farmacia.sistemafarmacia.controller;

import com.farmacia.sistemafarmacia.model.medicamento;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/medicamentos")
public class medicamentocontroller {

    private List<medicamento> lista = new ArrayList<>();

    public medicamentocontroller() {
        lista.add(new medicamento(1L, "Dipirona", 10.0));
        lista.add(new medicamento(2L, "Paracetamol", 12.5));
    }

    @GetMapping
    public List<medicamento> listar() {
        return lista;
    }
}