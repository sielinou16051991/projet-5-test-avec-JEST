/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { toHaveClass } from "@testing-library/jest-dom" // correspondance personnalisées DOM
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store"

//  Simulation de la navigation
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })}

//---------TEST UNITAIRE-----------
describe("Given I am connected as an employee", () => {

  //  Définir le stockage local fictif comme employée pour tous les tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock});
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee'}));
  })
  
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highted", async () => {
      // const html = NewBillUI()
      // document.body.innerHTML = html
      //to-do write assertion
      // Arange : create vertical layout for NewBill                              // Arranger : créer une mise en page verticale pour NewBill
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Act : simulate navigation                                                // Action: simuler la navigation
      router();
      window.onNavigate(ROUTES_PATH.NewBill)

      // Wait for icon
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      const windowIcon = screen.getAllByTestId('icon-window');

      //Assert : l’icône est mise en surbrillance lorsque la classe « active-icon » est présente                // Assert : icon is highlighted when it the "active-icon" class is present
      expect(mailIcon).toHaveClass('active-icon');
    });

    // test("Then ...", () => {
    //   const html = NewBillUI()
    //   document.body.innerHTML = html
    //   //to-do write assertion
    // })
  });

  describe('when I submit the form with empty fields', () => {      //  lorsque je soumets le formulaire avec des champs vides
    test('then I should stay on NewBill Page', () => {            //  alors je devrais rester sur la page NewBill
      //  Arrange : creation de l'ui NewBill
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });

      // get form
      const form = screen.getByTestId('form-new-bill');

      // Assert 1: Inputs
      expect(screen.getByTestId('expense-name').value).toBe('');
      expect(screen.getByTestId('datepicker').value).toBe('');
      expect(screen.getByTestId('amount').value).toBe('');
      expect(screen.getByTestId('vat').value).toBe('');
      expect(screen.getByTestId('pct').value).toBe('');
      expect(screen.getByTestId('commentary').value).toBe('');
      expect(screen.getByTestId('file').value).toBe('');

      // Act : From submit (event)
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      // Assert 2 : Form
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
  });

  describe('lorsque je télécharge un fichier avec le mauvais format', () => {      //    when I upload a file with the wrong format
    test('Ensuite, il devrait afficher le nom du fichier et masquer le message d’erreur ', async () => {   //   Then it should display the file name and hide the error message
      // Arange
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });
      const inputFile = screen.getByTestId('file');
  
      // Arrange Data : test file
      const errorFile = new File(['test-file'], 'test-file.txt', { type: 'text/plain' });
  
      // Act : upload the file (event)
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      inputFile.addEventListener('change', handleChangeFile);
      userEvent.upload(inputFile, errorFile);
  
      // Assert 
      await waitFor(() => screen.getByTestId('file-error-message'));
      expect(screen.getByTestId('file-error-message')).not.toHaveClass("d-none");
    });
  });
});


//-----------TESTS D’INTÉGRATION (POST)-------------------
                  //***********il est question dans cette partie de tester l'api de la fonction 
                  //***********rataché au bouton envoyé
                  //--------EN EFFET, IL Y A ENVOI D'UN OBJET ET REDIRECTION SUR LA PAGE "MES NOTES DE FRAIS" */               */
describe('Étant donné que je suis connecté en tant qu’employé sur la page NewBill', () => {      //  Given I am connected as Employee  on NewBill Page

  //  Définir le stockage local fictif comme employée pour tous les tests qui suivront
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
  })

  describe('When API is working', () => {
     test('Ensuite, il devrait envoyer une demande de MOCK POST et retourner à la page Factures', async () => {     //  Then it should send an Mock POST request and return to the Bills Page

      // Arrange or setup or configuration
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const form = screen.getByTestId('form-new-bill');
      const btnSubmit = document.getElementById("btn-send-bill");

      // Mock functions (fonction simulatrice)
      jest.spyOn(mockStore, 'bills');
      newBill.updateBill = jest.fn();

      // Mocked Data
      const mockedBill = {
        email: undefined,
        type: "Transports",
        name: "SIELINOU nOUBISSIE ERIC ROMUALD",
        date: "2022-12-10",
        amount: 150,
        vat: "20",
        pct: 10,
        commentary: "Réunion mission Bolled",
        fileUrl: "./justificatif.png",
        fileName: "justificatif.png",
        status: "pending",
      }

        //  Remplir les champs du formulaire avec des données simulées
        screen.getByTestId("expense-type").value = mockedBill.type;
        screen.getByTestId("expense-name").value = mockedBill.name;
        screen.getByTestId("datepicker").value = mockedBill.date;
        screen.getByTestId("amount").value = mockedBill.amount;
        screen.getByTestId("vat").value = mockedBill.vat;
        screen.getByTestId("pct").value = mockedBill.pct;
        screen.getByTestId("commentary").value = mockedBill.commentary;
        newBill.fileName = mockedBill.fileName;
        newBill.fileUrl = mockedBill.fileUrl;

        // Act (l'objet a tester) : form submit
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        const mockStoreBills = jest.fn(() => mockStore.bills());
        form.addEventListener('submit', handleSubmit);
        userEvent.click(btnSubmit);
        
        //  Assert (résultat atendu) : mocked function
        expect(handleSubmit).toHaveBeenCalled();
        expect(newBill.updateBill).toHaveBeenCalled();
        expect(newBill.updateBill).toHaveBeenCalledWith( mockedBill );
        expect(mockStoreBills).toHaveBeenCalled();

        // Assert (résultat atendu) : returns to the Bills Page
        expect(screen.getByTestId('Mes notes de frais')).toBeTruthy();
     });
  });

  describe('Lorsqu\'une erreur se produit sur l\'API de requête POST', () => {        //  When an error occurs on POST request API 
    test('Ensuite, il devrait avoire en console un message d\'erreur', async () => {      //  Then it should console a message error

      // Ararange or Setup or configuration
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // Mock functions : mockStore.bills and console.error()
      jest.spyOn(mockStore, 'bills');
      console.error = jest.fn();
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });

      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const form = screen.getByTestId('form-new-bill');
      const btnSubmit = document.getElementById("btn-send-bill");

      // Act (ce qu'il faut tester): soumission du formulaire
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      userEvent.click(btnSubmit);

      // Assert (Assertion: c.a.d ce à quoi on s'attend)
      expect(handleSubmit).toHaveBeenCalled();
      await new Promise(process.nextTick);
      expect(console.error).toHaveBeenCalled();
    

    });
  });
});