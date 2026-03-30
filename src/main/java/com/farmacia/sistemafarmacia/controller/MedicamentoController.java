package com.farmacia.sistemafarmacia.controller;

import com.farmacia.sistemafarmacia.model.Medicamento;
import com.farmacia.sistemafarmacia.repository.MedicamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/medicamentos")
public class MedicamentoController {

    @Autowired
    private MedicamentoRepository repository;

    @GetMapping
    public List<Medicamento> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Medicamento buscar(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public Medicamento cadastrar(@RequestBody Medicamento medicamento) {
        return repository.save(medicamento);
    }

    @PutMapping("/{id}")
    public Medicamento atualizar(@PathVariable Long id, @RequestBody Medicamento novo) {
        return repository.findById(id).map(m -> {
            m.setNome(novo.getNome());
            m.setPreco(novo.getPreco());
            m.setQuantidade(novo.getQuantidade());
            m.setValidade(novo.getValidade());
            return repository.save(m);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @PutMapping("/{id}/baixar-estoque")
    public Medicamento baixarEstoque(@PathVariable Long id,
                                     @RequestBody Map<String, Integer> body) {

        Integer quantidadeVendida = body.get("quantidade");

        if (quantidadeVendida == null || quantidadeVendida <= 0) {
            throw new RuntimeException("Quantidade inválida.");
        }

        return repository.findById(id).map(medicamento -> {

            if (medicamento.getQuantidade() == null) {
                throw new RuntimeException("Produto sem estoque cadastrado.");
            }

            if (medicamento.getQuantidade() < quantidadeVendida) {
                throw new RuntimeException("Estoque insuficiente.");
            }

            medicamento.setQuantidade(
                    medicamento.getQuantidade() - quantidadeVendida
            );

            return repository.save(medicamento);

        }).orElseThrow(() -> new RuntimeException("Medicamento não encontrado."));
    }
}