const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Configurando o Multer para armazenar os arquivos na pasta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Define o diretório para armazenar as fotos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renomeia o arquivo com o timestamp
    },
});

const upload = multer({ storage });

// Middleware para JSON
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Para servir arquivos da pasta 'uploads'

// Função para carregar funcionários
const loadEmployees = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'employees.json'), 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data));
        });
    });
};

// Rota para cadastrar funcionários
app.post('/api/employees', upload.single('photo'), async (req, res) => {
    const { name, rg, cpf, address, comment, nickname } = req.body;

    try {
        const employees = await loadEmployees(); // Carregando os funcionários existentes
        const newEmployee = {
            name,
            rg,
            cpf,
            address,
            comment,
            nickname,
            photo: req.file ? `/uploads/${req.file.filename}` : null, // Adiciona o caminho da foto
        };

        employees.push(newEmployee); // Adicionando o novo funcionário
        fs.writeFile(path.join(__dirname, 'data', 'employees.json'), JSON.stringify(employees, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao salvar funcionário' });
            }
            res.status(201).json(newEmployee);
        });
    } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar funcionário' });
    }
});

// Rota para carregar funcionários
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await loadEmployees(); // Carregando os funcionários
        res.json(employees);
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        res.status(500).json({ message: 'Erro ao carregar funcionários' });
    }
});

// Rota para excluir um funcionário
app.delete('/api/employees/:name', async (req, res) => {
    const employeeName = req.params.name;

    try {
        const employees = await loadEmployees(); // Carregando os funcionários
        const index = employees.findIndex(emp => emp.name === employeeName);

        if (index === -1) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }

        // Armazena o caminho da foto
        const photoPath = employees[index].photo ? path.join(__dirname, employees[index].photo) : null;

        // Remove o funcionário da lista
        employees.splice(index, 1);

        // Salva a lista atualizada no arquivo
        fs.writeFile(path.join(__dirname, 'data', 'employees.json'), JSON.stringify(employees, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao atualizar lista de funcionários' });
            }

            // Remove a foto do sistema de arquivos se existir
            if (photoPath) {
                fs.unlink(photoPath, (err) => {
                    if (err) {
                        console.error('Erro ao remover a foto:', err);
                    }
                });
            }

            res.status(200).json({ message: 'Funcionário excluído com sucesso!' });
        });
    } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        res.status(500).json({ message: 'Erro ao excluir funcionário' });
    }
});

// Inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
