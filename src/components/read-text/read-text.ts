import { Component, Input, ElementRef, Renderer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ReadPopoverService } from '../../app/services/settings/read-popover.service';
import { TextService } from '../../app/services/texts/text.service';
import { Storage } from '@ionic/storage';
import { ToastController, Events, ModalController } from 'ionic-angular';
import { IllustrationPage } from '../../pages/illustration/illustration';
import { ConfigService } from '@ngx-config/core';

/**
 * Generated class for the ReadTextComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'read-text',
  templateUrl: 'read-text.html'
})
export class ReadTextComponent {

  @Input() link: string;
  @Input() matches?: Array<string>;
  public text: any;
  protected errorMessage: string;
  defaultView: string;
  showToolTip: boolean;
  toolTipPosition: object;
  toolTipText: string;

  constructor(
    public events: Events,
    protected readPopoverService: ReadPopoverService,
    protected textService: TextService,
    protected sanitizer: DomSanitizer,
    protected storage: Storage,
    private toastCtrl: ToastController,
    private renderer: Renderer,
    private elementRef: ElementRef,
    private config: ConfigService,
    protected modalController: ModalController
  ) {
    this.defaultView = this.config.getSettings('defaults.ReadModeView');
    this.showToolTip = false;
    this.toolTipPosition = { top: 40 + 'px', left: 100 + 'px' };
    this.toolTipText = '';
  }

  ngOnInit() {
    this.setText();
  }

  ngAfterViewInit() {
    this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      if (event.target.classList.contains('variantScrollTarget') && this.readPopoverService.show.comments) {
        if (event.target !== undefined) {
          this.showTooltip(event);
        }
      }
      if (event.target.parentNode.classList.contains('ref_illustration')) {
        const hashNumber = event.target.parentNode.hash;
        const imageNumber = hashNumber.split('#')[1];
        this.openIllustration(imageNumber);
      }
    });
    this.renderer.listen(this.elementRef.nativeElement, 'mouseover', (event) => {
      if (event.target.classList.contains('tooltiptrigger') && this.readPopoverService.show.comments) {
        if (event.target !== undefined) {
          this.showTooltip(event);
        }
      }
    });
  }

  openIllustration(imageNumber) {
    const modal = this.modalController.create(IllustrationPage,
      { 'imageNumber': imageNumber },
      { cssClass: 'foo' }
    );
    modal.present();
    modal.onDidDismiss(data => {

    });
  }

  onClickFFiT(event) {
  }

  getCacheText(id: string) {
    this.storage.get(id).then((content) => {
      this.text = content;
      this.text = this.sanitizer.bypassSecurityTrustHtml(
        content.replace(/images\//g, 'assets/images/')
          .replace(/\.png/g, '.svg').replace(/class=\"([a-z A-Z _ 0-9]{1,140})\"/g, 'class=\"tei $1\"')
      );
      this.matches.forEach(function (val) {
        const re = new RegExp('(' + val + ')', 'g');
        this.text = this.sanitizer.bypassSecurityTrustHtml(
          content.replace(re, '<match>$1</match>')
        );
      }.bind(this));
    });
  }

  setText() {
    this.storage.get(this.link + '_est').then((content) => {
      if (content) {
        this.getCacheText(this.link + '_est');
      } else {
        this.getEstText();
      }
    });
  }

  getEstText() {
    this.textService.getEstablishedText(this.link).subscribe(
      text => {
        this.text = this.sanitizer.bypassSecurityTrustHtml(
          text.replace(/images\//g, 'assets/images/')
            .replace(/\.png/g, '.svg').replace(/class=\"([a-z A-Z _ 0-9]{1,140})\"/g, 'class=\"tei $1\"')
        );
        if (this.matches instanceof Array) {
          this.matches.forEach(function (val) {
            const re = new RegExp('(' + val + ')', 'g');
            this.text = this.sanitizer.bypassSecurityTrustHtml(
              text.replace(re, '<match>$1</match>')
            );
          }.bind(this));
        }
      },
      error => { this.errorMessage = <any>error }
    );
  }

  showTooltip(origin: any) {
    if (origin.target.nextSibling !== null && origin.target.nextSibling !== undefined) {
      if (origin.target.nextSibling.className !== undefined && String(origin.target.nextSibling.className).includes('tooltip')) {
        this.toolTipPosition = {
          top: (origin.target.offsetTop - (origin.target.offsetHeight / 2) + 4) +
            'px', left: (origin.target.offsetLeft + origin.target.offsetWidth + 4) + 'px'
        };
        this.showToolTip = true;
        this.toolTipText = origin.target.nextSibling.textContent;
        setTimeout(() => {
          this.showToolTip = false;
          this.toolTipText = '';
        }, 5000);
      }
    }
  }
}
