import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";


type MenuChild = {
  title: string;
  id: string;
  [key: string]: any
}

@Component({
  selector: 'app-recursive-accordion',
  templateUrl: './recursive-accordion.html',
  styleUrls: ['./recursive-accordion.scss'],
})
export class RecursiveAccordion implements OnInit {
  @Input() children: MenuChild[];
  @Input() selected: boolean = false;
  @Input() childId: string;
  @Input() parentPath: string = '';
  selectedMenu: string = '';
  currentRoute: string = '';

  constructor(public router: Router) {
    console.log(this.router)
  }

  ngOnInit() {
    if (this.childId) {
      this.selected = this.selected || this.router.url.includes(this.childId);
    }
  }

  toggleAccordion(value: string) {
    this.selectedMenu = this.selectedMenu === value ? '' : value;
  }
}
