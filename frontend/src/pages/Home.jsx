import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Componente de Filtro
const Filtros = ({ filtros, handleFiltroChange, generos, classificacoes }) => {
  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Buscar por título..."
          name="busca"
          value={filtros.busca}
          onChange={handleFiltroChange}
          className="p-2 border rounded"
        />
        <select
          name="genero"
          value={filtros.genero}
          onChange={handleFiltroChange}
          className="p-2 border rounded"
        >
          <option value="">Todos os gêneros</option>
          {generos.map((genero) => (
            <option key={genero.id} value={genero.id}>
              {genero.nome}
            </option>
          ))}
        </select>
        <select
          name="classificacao"
          value={filtros.classificacao}
          onChange={handleFiltroChange}
          className="p-2 border rounded"
        >
          <option value="">Todas as classificações</option>
          {classificacoes.map((classificacao) => (
            <option key={classificacao.id} value={classificacao.id}>
              {classificacao.classificacao}
            </option>
          ))}
        </select>
        <select
          name="notaMinima"
          value={filtros.notaMinima}
          onChange={handleFiltroChange}
          className="p-2 border rounded"
        >
          <option value="">Qualquer nota</option>
          {[4, 3, 2, 1].map((nota) => (
            <option key={nota} value={nota}>
              {nota}+ estrelas
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Componente de Card de Mídia
const MidiaCard = ({ midia, onAddToList, classificacoes }) => {
  const classificacao = classificacoes.find(
    (c) => c.id === midia.classificacao_etaria_id
  )?.classificacao;

  return (
    <div
      key={midia.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <img
        src={midia.capa_url || '/placeholder-capa.jpg'}
        alt={midia.titulo_brasileiro}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{midia.titulo_brasileiro}</h3>
        <div className="flex items-center mb-2">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{midia.media_avaliacao.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-2">
            ({midia.tipo === 'ANIME' ? `${midia.episodios} eps` : `${midia.capítulos} caps`})
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {midia.generos.map((genero) => (
            <span
              key={genero.id}
              className="px-2 py-1 bg-gray-100 rounded-full text-sm"
            >
              {genero.nome}
            </span>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => onAddToList(midia.id, 'ASSISTINDO')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            + Lista
          </button>
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            {classificacao}
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
const Home = () => {
  const navigate = useNavigate();
  const [midias, setMidias] = useState([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    genero: '',
    classificacao: '',
    notaMinima: '',
  });
  const [generos, setGeneros] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resMidias, resGeneros, resClassificacoes] = await Promise.all([
          axios.get('http://localhost:5000/api/midias'),
          axios.get('http://localhost:5000/api/generos'),
          axios.get('http://localhost:5000/api/classificacoes'),
        ]);
        setMidias(resMidias.data);
        setGeneros(resGeneros.data);
        setClassificacoes(resClassificacoes.data);
        setCarregando(false);
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  // Atualizar filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filtrar mídias
  const midiasFiltradas = midias.filter((midia) => {
    return (
      midia.titulo_brasileiro.toLowerCase().includes(filtros.busca.toLowerCase()) &&
      (filtros.genero ? midia.generos.some((g) => g.id === parseInt(filtros.genero)) : true) &&
      (filtros.classificacao ? midia.classificacao_etaria_id === parseInt(filtros.classificacao) : true) &&
      midia.media_avaliacao >= (filtros.notaMinima || 0)
    );
  });

  // Adicionar à lista
  const handleAdicionarLista = async (midiaId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post(
        `http://localhost:5000/api/listas`,
        { midiaId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Adicionado à sua lista com sucesso!');
    } catch (erro) {
      console.error('Erro ao adicionar à lista:', erro.response?.data?.erro || 'Erro desconhecido');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtros */}
      <Filtros
        filtros={filtros}
        handleFiltroChange={handleFiltroChange}
        generos={generos}
        classificacoes={classificacoes}
      />

      {/* Listagem */}
      {carregando ? (
        <div className="text-center">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {midiasFiltradas.map((midia) => (
            <MidiaCard
              key={midia.id}
              midia={midia}
              onAddToList={handleAdicionarLista}
              classificacoes={classificacoes}
            />
          ))}
        </div>
      )}

      {/* Mensagem de Nenhum Resultado */}
      {!carregando && midiasFiltradas.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Nenhum resultado encontrado com esses filtros
        </div>
      )}
    </div>
  );
};

export default Home;