document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('employeeForm');
    const showFormBtn = document.getElementById('showFormBtn');

    // Evento para mostrar/ocultar o formulário
    showFormBtn.addEventListener('click', () => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none'; // Alterna a visibilidade do formulário
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form); // Captura os dados do formulário

        const response = await fetch('/api/employees', {
            method: 'POST',
            body: formData, // O FormData faz isso automaticamente
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro ao cadastrar funcionário:', errorText);
            alert('Erro ao cadastrar funcionário. Verifique o console para mais detalhes.');
            return;
        }

        const newEmployee = await response.json();
        alert('Funcionário cadastrado com sucesso!');
        loadEmployees(); // Atualiza a lista de funcionários
        form.reset(); // Limpa o formulário após o envio
        form.style.display = 'none'; // Oculta o formulário após o cadastro
    });

    // Função para carregar funcionários
    async function loadEmployees() {
        const response = await fetch('/api/employees');

        if (!response.ok) {
            console.error('Erro ao carregar funcionários:', await response.text());
            return;
        }

        const employees = await response.json();

        const employeeList = document.getElementById('employeeList');
        employeeList.innerHTML = ''; // Limpa a lista antes de adicionar novos funcionários

        employees.forEach(employee => {
            const card = document.createElement('div');
            card.className = 'employee-card'; // Adiciona a classe para estilo
            card.innerHTML = `
                <h3>${employee.name || 'Nome não disponível'}</h3>
                <p>RG: ${employee.rg || 'RG não disponível'}</p>
                <p>CPF: ${employee.cpf || 'CPF não disponível'}</p>
                <p>Endereço: ${employee.address || 'Endereço não disponível'}</p>
                <p>Apelido: ${employee.nickname || 'Apelido não disponível'}</p>
                <p>Comentário: ${employee.comment || 'Comentário não disponível'}</p>
                ${employee.photo ? `<img src="${employee.photo}" alt="${employee.name}" width="100">` : '<p>Foto não disponível</p>'} <!-- Adiciona a foto se existir -->
                <button class="deleteBtn" data-name="${employee.name}">Excluir</button>
            `;

            // Adiciona o botão de exclusão
            const deleteBtn = card.querySelector('.deleteBtn');
            deleteBtn.addEventListener('click', () => handleDelete(employee.name));

            employeeList.appendChild(card);
        });
    }

    // Função para lidar com a exclusão
    async function handleDelete(employeeName) {
        // Solicita a senha ao usuário
        const password = prompt('Digite a senha para excluir o funcionário:');

        // Verifica a senha
        const correctPassword = '007'; // A senha correta

        if (password !== correctPassword) {
            alert('Senha incorreta! Não foi possível excluir o funcionário.');
            return;
        }

        const response = await fetch(`/api/employees/${employeeName}`, {
            method: 'DELETE', // O método para deletar
        });

        if (!response.ok) {
            console.error('Erro ao excluir funcionário:', await response.text());
            alert('Erro ao excluir funcionário. Verifique o console para mais detalhes.');
            return;
        }

        alert('Funcionário excluído com sucesso!');
        loadEmployees(); // Atualiza a lista de funcionários após a exclusão
    }

    loadEmployees(); // Carrega os funcionários ao iniciar
});
