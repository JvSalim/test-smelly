const userServiceModule = require('../src/userService');
const UserService = userServiceModule.UserService || userServiceModule;

const DADOS_USUARIO_PADRAO = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService – testes limpos (refatorados)', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  //
  // 1. createUser
  //
  describe('createUser()', () => {
    test('cria usuário válido com todos os campos obrigatórios', () => {
      // Arrange
      const { nome, email, idade } = DADOS_USUARIO_PADRAO;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario).toBeDefined();
      expect(usuario.id).toBeDefined();
      expect(usuario.nome).toBe(nome);
      expect(usuario.email).toBe(email);
      expect(usuario.idade).toBe(idade);
      expect(usuario.status).toBe('ativo');
    });

    test('lança erro quando nome não é informado', () => {
      // Arrange
      const nome = '';
      const email = 'teste@email.com';
      const idade = 20;

      // Act + Assert
      expect(() => userService.createUser(nome, email, idade))
        .toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro quando email não é informado', () => {
      // Arrange
      const nome = 'Fulano';
      const email = '';
      const idade = 20;

      // Act + Assert
      expect(() => userService.createUser(nome, email, idade))
        .toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro quando idade não é informada', () => {
      // Arrange
      const nome = 'Fulano';
      const email = 'fulano@email.com';
      const idade = undefined;

      // Act + Assert
      expect(() => userService.createUser(nome, email, idade))
        .toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro quando idade é menor que 18', () => {
      // Arrange
      const nome = 'Menor';
      const email = 'menor@email.com';
      const idade = 17;

      // Act + Assert
      expect(() => userService.createUser(nome, email, idade))
        .toThrow('O usuário deve ser maior de idade.');
    });
  });

  //
  // 2. getUserById
  //
  describe('getUserById()', () => {
    test('retorna o usuário quando o id existe', () => {
      // Arrange
      const criado = userService.createUser(
        DADOS_USUARIO_PADRAO.nome,
        DADOS_USUARIO_PADRAO.email,
        DADOS_USUARIO_PADRAO.idade
      );

      // Act
      const buscado = userService.getUserById(criado.id);

      // Assert
      expect(buscado).toBeDefined();
      expect(buscado.id).toBe(criado.id);
      expect(buscado.nome).toBe(DADOS_USUARIO_PADRAO.nome);
    });

    test('retorna null quando o id não existe', () => {
      // Act
      const resultado = userService.getUserById('id-inexistente');

      // Assert
      expect(resultado).toBeNull();
    });
  });

  //
  // 3. deactivateUser
  //    (refatora o teste com for/if do arquivo smelly)
  //
  describe('deactivateUser()', () => {
    test('desativa usuário comum e retorna true', () => {
      // Arrange
      const usuario = userService.createUser('Comum', 'comum@teste.com', 30, false);

      // Act
      const ok = userService.deactivateUser(usuario.id);
      const atualizado = userService.getUserById(usuario.id);

      // Assert
      expect(ok).toBe(true);
      expect(atualizado.status).toBe('inativo');
    });

    test('não desativa usuário admin e retorna false', () => {
      // Arrange
      const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const ok = userService.deactivateUser(admin.id);
      const atualizado = userService.getUserById(admin.id);

      // Assert
      expect(ok).toBe(false);
      expect(atualizado.status).toBe('ativo');
      expect(atualizado.isAdmin).toBe(true);
    });

    test('retorna false ao tentar desativar usuário inexistente', () => {
      // Act
      const ok = userService.deactivateUser('nao-existe');

      // Assert
      expect(ok).toBe(false);
    });
  });
  //
  // 4. generateUserReport
  //
  describe('generateUserReport()', () => {
    test('retorna mensagem padrão quando não há usuários', () => {
      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('--- Relatório de Usuários ---');
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });

    test('lista usuários com id, nome e status', () => {
      // Arrange
      const u1 = userService.createUser('Alice', 'alice@email.com', 28);
      const u2 = userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert (menos frágil: olha conteúdo, não formatação exata)
      expect(relatorio).toContain('--- Relatório de Usuários ---');
      expect(relatorio).toContain(u1.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('ativo');

      expect(relatorio).toContain(u2.id);
      expect(relatorio).toContain('Bob');
    });
  });
});
