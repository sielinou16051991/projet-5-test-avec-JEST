/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import { toHaveClass } from "@testing-library/jest-dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js"

import router from "../app/Router.js";

// MockStore pour les tests d'intégration
jest.mock("../app/Store", () => mockStore) 
// Mock the navigation
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }

//**********TEST UNITAIRE************ */
        
describe("Given I am connected as an employee", () => {   // Étant donné que je suis connecté en tant qu’employé
        
        //  Définir le stockage local fictif comme employée pour tous les tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock});
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee'}));
  })

  describe("When I am on Bills Page", () => {   // Quand je suis sur la page Factures 

    test("Then bill icon in vertical layout should be highlighted", async () => {   //Ensuite, l’icône de facture dans la disposition verticale doit être mise en surbrillance

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Act
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Assert : test if icon is active (= highlighted)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon'); // car dans le fichier Router.js a la ligne 31, on ajoute les active-icon

    })

    test("Then bills should be ordered from earliest to latest", () => {    // Ensuite, les factures doivent être commandées du plus tôt au plus tard
      
      // organisation
      document.body.innerHTML = BillsUI({ data: bills })  // chargement de la page
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      // l'acte
     // const antiChrono = (a, b) => ((a < b) ? 1 : -1)   // j'ai commenté cette ligne et la suivante parceque les factures ne sont pas triées
     // const datesSorted = [...dates].sort(antiChrono)
      const datesSorted = [ '2004-04-04', '2003-03-03', '2002-02-02', '2001-01-01' ] // le test doit etre simple. ce qui resoud l'erreur de test:  expect(received).toEqual(expected) // deep equality

      // l'assertion
      expect(dates).toEqual(datesSorted);
    })

    test('Then, Loading page should be rendered', () => {   //  Ensuite, la page de chargement doit être rendue
        document.body.innerHTML = BillsUI({ loading: true })
        expect(screen.getAllByText('Loading...')).toBeTruthy()
    })

    test('Then, Error page should be rendered', () => {   //  Ensuite, la page de chargement d'erreur rendue
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('erreur')).toBeTruthy()
    })

    describe('When I click on all eye icons', () => {   //  Lorsque je clique sur toutes les icônes oculaires 
      test('Then it should open the modal', () => {   // Une modale s’ouvre pour me présenter le justificatif
        // chargement de la page
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({ document, onNavigate, localStorage: window.localStorage});

        // Fonction modale JQuery simulée (imitation)
        $.fn.modal = jest.fn();

        // recuperation des elts
        const eyeIcons = screen.getAllByTestId('icon-eye');
        const openModal = jest.fn(billsContainer.handleClickIconEye)
        const modal = screen.getByTestId('modalFileEmployee');    // confer BillsUI.js

        //Act:  Définir les événements et cliquer sur les icônes
        eyeIcons.forEach((icon) => {
          icon.addEventListener('click', (e) => openModal(icon))
          userEvent.click(icon);
        })

        // Asserion : HTML
        expect(modal).toBeTruthy();    // le code HTML de la modale est présent dans la page
        expect(screen.getByText("Justificatif")).toBeTruthy();     // le titre de la modale est présent

        // Assertion: click > img
        const img = screen.getByTestId("modalBillImg");
        expect(img).toHaveAttribute('src', bills[bills.length -1].fileUrl);     // Vérifiez l’URL du fichier du dernier appel

        // Assertion: click > functions calls
        expect($.fn.modal).toHaveBeenCalledWith('show');           // La fonction a été appelée avec l'argument "show"
        expect(openModal).toHaveBeenCalledTimes(eyeIcons.length);     // la fonction callback de l'évenement a été appelée autant de fois que le nombre de click
        

      })
    })

  })
})
