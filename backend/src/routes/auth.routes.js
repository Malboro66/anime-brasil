const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Registro de usuário
router.post('/registro', async (req, res) => {
  try {
    const { nome_usuario, email, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const novoUsuario = await pool.query(
      'INSERT INTO usuarios (nome_usuario, email, senha_hash) VALUES ($1, $2, $3) RETURNING *',
      [nome_usuario, email, senhaHash]
    );

    res.json(novoUsuario.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;