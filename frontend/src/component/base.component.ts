export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  private templateElm: HTMLTemplateElement;
  private hostElm: T;
  element: U;

  constructor(
    templateId: string,
    hostId: string,
    insertPosition: InsertPosition,
    elementId?: string
  ) {
    this.templateElm = document.querySelector(`#${templateId}`)!;
    this.hostElm = document.querySelector(`#${hostId}`)!;

    const importedNode = document.importNode(this.templateElm.content, true);

    this.element = importedNode.firstElementChild! as U;

    if (elementId) this.element.id = elementId;

    this.hostElm.insertAdjacentElement(insertPosition, this.element!);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}
