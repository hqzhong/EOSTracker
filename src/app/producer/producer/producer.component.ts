import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, share, catchError } from 'rxjs/operators';
import { EosService } from '../../services/eos.service';
import { AppService } from '../../services/app.service';
import {extractSourceMap} from '@angular/compiler/testing/src/output/source_map_util';

@Component({
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss']
})
export class ProducerComponent implements OnInit {

  name$: Observable<string>;
  producer$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private eosService: EosService,
    private appService: AppService
  ) { }

  ngOnInit() {
    this.name$ = this.route.params.pipe(
      map(params => params.id)
    );
    this.producer$ = combineLatest(
      this.name$,
      this.eosService.getChainStatus(),
      this.eosService.getProducers(),
      this.name$.pipe(
        switchMap(name => this.eosService.getDeferAccount(name))
      ),
      this.eosService.getGlobal4(),
      this.appService.eosStats$
    ).pipe(
      map(([name, chainStatus, producers, account, global4, eosStats]) => {
        const producer = producers.find(producer => producer.owner === name);
        const index = producers.findIndex(producer => producer.owner === name);
        const votesToRemove = producers.reduce((acc, cur) => {
          const percentageVotes = cur.total_votes / chainStatus.total_producer_vote_weight * 100;
          if (percentageVotes * 200 < 100) {
            acc += parseFloat(cur.total_votes);
          }
          return acc;
        }, 0);
        let supply = Number(eosStats.YAS.supply.replace('YAS', ''));
        let bpay = global4.continuous_rate * supply * 10000 / (global4.votepay_factor * 21 * 365);
        let vpay_total = global4.continuous_rate * supply * 10000 / (global4.inflation_pay_factor * 365);
        let position = parseInt(index) + 1;
        let reward = 0;
        let percentageVotes = producer.total_votes / chainStatus.total_producer_vote_weight * 100;
        let percentageVotesRewarded = producer.total_votes / (chainStatus.total_producer_vote_weight - votesToRemove) * 100;

        reward += percentageVotesRewarded * vpay_total / 100;
        if (reward < 100) {
          reward = 0;
        }
        if (position < 22) {
          reward += bpay;
        }
        return {
          ...producer,
          account: account,
          position: position,
          reward: reward.toFixed(0),
          votes: percentageVotes.toFixed(2)
        };
      }),
      switchMap(producer => {
        if (!producer.url) {
          return of(producer);
        } else {
          return this.appService.getBpJson(producer.url).pipe(
            catchError(() => of(null)),
            map(bpJson => ({
              ...producer,
              bpJson,
              location: bpJson && bpJson.nodes && bpJson.nodes[0] && bpJson.nodes[0].location,
              validated: bpJson && bpJson.producer_public_key === producer.producer_key && bpJson.producer_account_name === producer.owner
            }))
          );
        }
      }),
      share()
    );
  }

}
