package com.farmacia.sistemafarmacia.controller;

import com.farmacia.sistemafarmacia.model.Medicamento;
import com.farmacia.sistemafarmacia.model.Venda;
import com.farmacia.sistemafarmacia.repository.MedicamentoRepository;
import com.farmacia.sistemafarmacia.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@CrossOrigin(origins = "*")
public class MedicamentoController {

    @Autowired
    private MedicamentoRepository repository;

    @Autowired
    private VendaRepository vendaRepository;

    @GetMapping
    public List<Medicamento> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Medicamento buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public Medicamento cadastrar(@RequestBody Medicamento medicamento) {
        return repository.save(medicamento);
    }

    @PutMapping("/{id}")
    public Medicamento atualizar(@PathVariable Long id, @RequestBody Medicamento medicamento) {
        medicamento.setId(id);
        return repository.save(medicamento);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @PostMapping("/{id}/vender/{quantidade}")
    public String vender(@PathVariable Long id, @PathVariable Integer quantidade) {
        Medicamento medicamento = repository.findById(id).orElse(null);

        if (medicamento == null) {
            return "Medicamento não encontrado";
        }

        if (medicamento.getQuantidade() < quantidade) {
            return "Estoque insuficiente";
        }

        medicamento.setQuantidade(medicamento.getQuantidade() - quantidade);
        repository.save(medicamento);

        Venda venda = new Venda();
        venda.setNomeMedicamento(medicamento.getNome());
        venda.setQuantidadeVendida(quantidade);
        venda.setPrecoUnitario(medicamento.getPreco());
        venda.setValorTotal(medicamento.getPreco() * quantidade);
        venda.setDataVenda(LocalDateTime.now());

        vendaRepository.save(venda);

        return "Venda realizada com sucesso";
    }
}