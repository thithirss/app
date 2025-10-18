// Serviço para buscar dados de localização (cidades e estados)
import axios from 'axios'

// API do IBGE para localidades
const ibgeApi = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1'
})

export const locationService = {
  /**
   * Retorna a lista de estados brasileiros da API do IBGE
   */
  async getEstados() {
    try {
      const response = await ibgeApi.get('/localidades/estados?orderBy=nome')
      return response.data.map(estado => ({
        nome: estado.nome,
        sigla: estado.sigla,
        id: estado.id
      }))
    } catch (error) {
      console.error('Erro ao buscar estados:', error)
      return []
    }
  },

  /**
   * Busca cidades com base no termo de pesquisa e UF usando a API do IBGE
   * @param {string} query - Termo de pesquisa
   * @param {string} uf - Sigla do estado (opcional)
   */
  async getCidades(query = '', uf = null) {
    try {
      let url = '/localidades/municipios'
      
      // Se tiver UF, filtra por estado
      if (uf) {
        url = `/localidades/estados/${uf}/municipios`
      }
      
      const response = await ibgeApi.get(url)
      let cidades = response.data.map(cidade => ({
        nome: cidade.nome,
        id: cidade.id,
        uf: cidade.microrregiao.mesorregiao.UF.sigla
      }))
      
      // Filtra pelo termo de busca
      if (query) {
        const termoBusca = query.toLowerCase()
        cidades = cidades.filter(cidade => 
          cidade.nome.toLowerCase().includes(termoBusca)
        )
      }
      
      return cidades.map(cidade => cidade.nome)
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
      return []
    }
  },

  /**
   * Busca localidades (cidade e estado combinados) com base no termo de pesquisa
   * @param {string} query - Termo de pesquisa
   */
  async getLocalidades(query = '') {
    try {
      // Se o campo estiver vazio ou com menos de 2 caracteres, mostra cidades populares
      if (!query || query.length < 2) {
        // Lista de cidades populares do Brasil
        const cidadesPopulares = [
          'São Paulo - SP',
          'Rio de Janeiro - RJ',
          'Brasília - DF',
          'Salvador - BA',
          'Fortaleza - CE',
          'Belo Horizonte - MG',
          'Manaus - AM',
          'Curitiba - PR',
          'Recife - PE',
          'Porto Alegre - RS',
          'Belém - PA',
          'Goiânia - GO',
          'Guarulhos - SP',
          'Campinas - SP',
          'São Luís - MA',
          'São Gonçalo - RJ',
          'Maceió - AL',
          'Duque de Caxias - RJ',
          'Natal - RN',
          'Campo Grande - MS'
        ]
        
        // Busca os dados dos estados para compor o objeto de retorno
        const estadosResponse = await ibgeApi.get('/localidades/estados')
        const estados = estadosResponse.data
        
        // Retorna as cidades populares no formato esperado
        return cidadesPopulares.map((cidadeUf, index) => {
          const [cidade, uf] = cidadeUf.split(' - ')
          const estado = estados.find(e => e.sigla === uf) || { id: index + 1, nome: uf }
          
          return {
            id: `popular_${index}`,
            nome: cidadeUf,
            cidade: cidade,
            estado: {
              nome: estado.nome || uf,
              sigla: uf,
              id: estado.id || index + 1
            }
          }
        })
      }
      
      // Busca todos os municípios e filtra localmente
      const response = await ibgeApi.get('/localidades/municipios')
      const termoBusca = query.toLowerCase()
      
      // Filtra municípios que correspondem ao termo de busca
      let municipiosFiltrados = response.data.filter(cidade => 
        cidade.nome.toLowerCase().includes(termoBusca)
      )
      
      // Mapeia os resultados para o formato esperado
      let localidades = municipiosFiltrados.map(cidade => {
        const estado = cidade.microrregiao.mesorregiao.UF
        return {
          id: `${cidade.id}`,
          nome: `${cidade.nome} - ${estado.sigla}`,
          cidade: cidade.nome,
          estado: {
            nome: estado.nome,
            sigla: estado.sigla,
            id: estado.id
          }
        }
      })
      
      // Busca também por estados que correspondam ao termo
      const estadosResponse = await ibgeApi.get('/localidades/estados')
      const estados = estadosResponse.data
      
      const estadosEncontrados = estados.filter(estado => 
        estado.nome.toLowerCase().includes(termoBusca) || 
        estado.sigla.toLowerCase().includes(termoBusca)
      )
      
      // Se encontrou estados, adiciona algumas cidades desses estados
      for (const estado of estadosEncontrados) {
        const cidadesEstadoResponse = await ibgeApi.get(`/localidades/estados/${estado.id}/municipios`)
        const cidadesEstado = cidadesEstadoResponse.data.slice(0, 10)
        
        const localidadesEstado = cidadesEstado.map(cidade => ({
          id: `${cidade.id}`,
          nome: `${cidade.nome} - ${estado.sigla}`,
          cidade: cidade.nome,
          estado: {
            nome: estado.nome,
            sigla: estado.sigla,
            id: estado.id
          }
        }))
        
        localidades = [...localidades, ...localidadesEstado]
      }
      
      // Adiciona busca por "Cidade MG" ou "Cidade - MG"
      if (termoBusca.includes(' ')) {
        const partes = termoBusca.split(' ')
        const possibleUf = partes[partes.length - 1]
        
        // Se a última parte parece ser uma UF (2 caracteres)
        if (possibleUf.length === 2) {
          const estadoEncontrado = estados.find(estado => 
            estado.sigla.toLowerCase() === possibleUf
          )
          
          if (estadoEncontrado) {
            const nomeCidade = partes.slice(0, -1).join(' ').replace('-', '').trim()
            const cidadesEstadoResponse = await ibgeApi.get(`/localidades/estados/${estadoEncontrado.id}/municipios`)
            
            const cidadesEstadoFiltradas = cidadesEstadoResponse.data.filter(cidade =>
              cidade.nome.toLowerCase().includes(nomeCidade)
            )
            
            const localidadesEstadoFiltradas = cidadesEstadoFiltradas.map(cidade => ({
              id: `${cidade.id}`,
              nome: `${cidade.nome} - ${estadoEncontrado.sigla}`,
              cidade: cidade.nome,
              estado: {
                nome: estadoEncontrado.nome,
                sigla: estadoEncontrado.sigla,
                id: estadoEncontrado.id
              }
            }))
            
            localidades = [...localidades, ...localidadesEstadoFiltradas]
          }
        }
      }
      
      // Remove duplicatas baseado no ID
      const localidadesUnicas = Array.from(
        new Map(localidades.map(item => [item.id, item])).values()
      )
      
      // Limita o número de resultados para melhor performance
      return localidadesUnicas.slice(0, 50)
    } catch (error) {
      console.error('Erro ao buscar localidades:', error)
      return []
    }
  }
}
    
