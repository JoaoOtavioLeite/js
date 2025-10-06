Galeria de Imagens com persistência em Local Storage

Arquivos:
- index.html: página principal
- styles.css: estilos
- script.js: lógica para adicionar/remover e persistir imagens

Como usar:
- Abra o arquivo `index.html` no navegador (duplo-clique ou `start index.html` no PowerShell dentro da pasta).
- Selecione uma imagem com o campo de arquivo e clique em "Adicionar imagem".
- Clique em uma imagem para removê-la (confirmação será solicitada).

Notas:
- As imagens são redimensionadas (se maiores que 1200px) e salvas como dataURL em localStorage.
- Há um limite configurável (`MAX_IMAGES`) para evitar estourar o espaço do localStorage.
- Se o navegador apresentar erro ao salvar por excesso de espaço, remova algumas imagens e tente novamente.

Sugestões futuras:
- Implementar paginação ou thumbnails servidos por backend para galerias grandes.
- Salvar apenas uma referência a imagens no servidor em vez de dataURLs locais.
