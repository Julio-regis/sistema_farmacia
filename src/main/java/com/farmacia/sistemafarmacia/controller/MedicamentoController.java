package com.farmacia.sistemafarmacia.controller;

import com.farmacia.sistemafarmacia.model.Medicamento;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/medicamentos")
public class MedicamentoController {

    private List<Medicamento> lista = new ArrayList<>();

    public MedicamentoController() {
        lista.add(new Medicamento(1L, "Dipirona", 10.0));
        lista.add(new Medicamento(2L, "Paracetamol", 12.5));
    }

    @GetMapping
    public List<Medicamento> listar() {
        return lista;
    }

    @PostMapping
    public Medicamento adicionar(@RequestBody Medicamento medicamento) {
        lista.add(medicamento);
        return medicamento;
    }

    @GetMapping("/{id}")
    public Medicamento buscarPorId(@PathVariable Long id) {
        for (Medicamento m : lista) {
            if (m.getId().equals(id)) {
                return m;
            }
        }
        return null;
    }

    @PutMapping("/{id}")
    public Medicamento atualizar(@PathVariable Long id, @RequestBody Medicamento medicamentoAtualizado) {
        for (Medicamento m : lista) {
            if (m.getId().equals(id)) {
                m.setNome(medicamentoAtualizado.getNome());
                m.setPreco(medicamentoAtualizado.getPreco());
                return m;
            }
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public String deletar(@PathVariable Long id) {
        lista.removeIf(m -> m.getId().equals(id));
        return "Medicamento removido com sucesso!";
    }
}