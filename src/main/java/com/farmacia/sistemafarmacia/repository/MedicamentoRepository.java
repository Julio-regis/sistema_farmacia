package com.farmacia.sistemafarmacia.repository;

import com.farmacia.sistemafarmacia.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
}