import { Component, Input } from '@angular/core';
import { SongService } from 'src/app/services/song/song.service';
import { config } from "src/app/services/config/config";
import { Song } from 'src/app/models/song.model';

declare var MIDIjs: any;

/**
 * Generated class for the SongExampleComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'song-example',
  templateUrl: 'song-example.html',
  styleUrls: ['song-example.scss']
})
export class SongExampleComponent {

  @Input() songDatafile?: string;
  @Input() legacyId?: string;

  songFile = '';
  song: any;
  musicXmlPath = '';
  playing = false;

  constructor(
    public songService: SongService
  ) {
    this.setAudio();
    this.playing = false;
    this.musicXmlPath = config.app.apiEndpoint + '/' +
                        config.app.machineName +
                        '/song-files/musicxml/';
  }

  ngOnInit() {
    this.getSongDetails();
  }

  setAudio() {
    // TODO
    // midi or mp3?
  }

  playSong() {
    this.playing = true;
    MIDIjs.play(`assets/midi-files/${this.songDatafile}.mid`);
  }

  stopSong() {
    MIDIjs.stop();
    this.playing = false;
  }

  getSongDetails() {
    if (this.songDatafile) {
      this.getSong(this.songDatafile);
    } else if (this.legacyId) {
      this.getSongByItemId();
    }
  }

  getSong(id: any) {
    this.songService.getSong(id).subscribe({
      next: song => {
        this.song = new Song(song);
      },
      error: err => { console.error(err) }
    });
  }

  getSongDatafile(id: any) {
    this.songService.getSong(id).subscribe({
      next: song => {
        this.song = new Song(song);
      },
      error: err => { console.error(err) }
    });
  }

  getSongByItemId () {
    this.songService.getSongById(this.legacyId).subscribe({
      next: song => {
        this.getSong(song.id);
      },
      error: err => { console.error(err) }
    });
  }

  ionViewWillLeave() {
    this.stopSong();
  }

}
