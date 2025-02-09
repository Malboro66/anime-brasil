import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

// Componente de Campo de Entrada Genérico
const InputField = ({ label, id, name, type, value, onChange, error, icon, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Componente de Exibição de Erro
const ErrorDisplay = ({ message }) => {
  if (!message) return null;
  return (
    <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">
      {message}
    </div>
  );
};

// Componente Principal
const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome_usuario: '',
    email: '',
    senha: '',
    confirmar_senha: '',
  });
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Validar formulário
  const validarFormulario = () => {
    const novosErros = {};
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!formData.nome_usuario.trim()) {
      novosErros.nome_usuario = 'Nome de usuário é obrigatório';
    } else if (formData.nome_usuario.length < 3) {
      novosErros.nome_usuario = 'Mínimo 3 caracteres';
    }

    if (!formData.email.trim()) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!regexEmail.test(formData.email)) {
      novosErros.email = 'E-mail inválido';
    }

    if (!formData.senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (!regexSenha.test(formData.senha)) {
      novosErros.senha = 'Mínimo 8 caracteres com letras e números';
    }

    if (formData.senha !== formData.confirmar_senha) {
      novosErros.confirmar_senha = 'As senhas não coincidem';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setCarregando(true);
    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/registro', {
        nome_usuario: formData.nome_usuario,
        email: formData.email,
        senha: formData.senha,
      });
      if (response.status === 201) {
        navigate('/login', { state: { registroSucesso: true } });
      }
    } catch (erro) {
      if (erro.response?.data?.erro) {
        setErros({ servidor: erro.response.data.erro });
      } else {
        setErros({ servidor: 'Erro ao conectar com o servidor' });
      }
    } finally {
      setCarregando(false);
    }
  };

  // Atualizar campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erros ao digitar
    if (erros[name]) {
      setErros((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar nova conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Faça login aqui
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensagem de Erro do Servidor */}
            <ErrorDisplay message={erros.servidor} />

            {/* Nome de Usuário */}
            <InputField
              label="Nome de Usuário"
              id="nome_usuario"
              name="nome_usuario"
              type="text"
              value={formData.nome_usuario}
              onChange={handleChange}
              error={erros.nome_usuario}
            />

            {/* Email */}
            <InputField
              label="E-mail"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={erros.email}
            />

            {/* Senha */}
            <InputField
              label="Senha"
              id="senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={formData.senha}
              onChange={handleChange}
              error={erros.senha}
              icon={
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="flex items-center"
                >
                  {mostrarSenha ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              }
            />

            {/* Confirmar Senha */}
            <InputField
              label="Confirmar Senha"
              id="confirmar_senha"
              name="confirmar_senha"
              type="password"
              value={formData.confirmar_senha}
              onChange={handleChange}
              error={erros.confirmar_senha}
            />

            {/* Botão de Registro */}
            <button
              type="submit"
              disabled={carregando}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                carregando ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {carregando ? 'Registrando...' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registro;