import { Form } from "./common/Form";
import { IFormOrder } from "../types";
import { IEvents } from "./base/events";

interface IOrderActions {
  onButtonCardClick: (event: MouseEvent) => void;
  onButtonCashClick: (event: MouseEvent) => void;
}

export class OrderData extends Form<IFormOrder> {
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected buttonActiveClass = 'button_alt-active';
  constructor(container: HTMLFormElement, events: IEvents, actions?: IOrderActions) {
    super(container, events);
    this.cardButton = this.container.elements.namedItem('card') as HTMLButtonElement;
    this.cashButton = this.container.elements.namedItem('cash') as HTMLButtonElement;
    this.setClass(this.cardButton, this.buttonActiveClass);

    if (actions?.onButtonCardClick) {
      if (this.cardButton) {
        this.cardButton.addEventListener('click', actions.onButtonCardClick);
      }
    }

    if (actions?.onButtonCashClick) {
      if (this.cashButton) {
        this.cashButton.addEventListener('click', actions.onButtonCashClick);
      }
    }

    this.valid = false;
  }

  get card() {
    return this.cardButton;
  }

  get cash() {
    return this.cashButton;
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }

  switchPayment(): void {
    this.toggleClass(this.cash, this.buttonActiveClass);
    this.toggleClass(this.card, this.buttonActiveClass);
  }
}

export class Contacts extends Form<IFormOrder> {
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
  }

  set phone(value: string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
  }

  set email(value: string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
  }
}