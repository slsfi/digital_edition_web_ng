import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-recursive-accordion',
  templateUrl: './recursive-accordion.html',
  styleUrls: ['./recursive-accordion.scss'],
})
export class RecursiveAccordion implements OnInit {
  @Input() children: {
    title: string;
    [key: string]: any
  }[];
  @Input() selected: boolean = false;
  selectedMenu: string = '';
  constructor() { }

  ngOnInit() {}

  toggleAccordion(value: string) {
    this.selectedMenu = this.selectedMenu === value ? '' : value;
  }
}
