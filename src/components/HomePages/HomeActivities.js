import { Routes, Route, Link } from 'react-router-dom';

function HomeActivities() {
  return (
    <>
      <div className="row row-cols-1 row-cols-lg-2 mt-4 g-2">
        <Link to="/activity/C2_315080000H_080680">
          <div className="col d-flex align-items-stretch">
            <div className="card border-0 w-100">
              <img
                className="card activity-img"
                src="https://www.taiwan.net.tw/att/event/472a57c0-ecf7-4b08-bcb8-a2e5c0411598.jpg"
              />
              <div className="card-img-overlay d-flex flex-column justify-content-between activity-img-mask">
                <h5 className="pb-4" style={{ width: '85%' }}>
                  2022桃園地景藝術節
                </h5>
                <h6 className="text-truncate3">
                  每年移動的藝術節地景藝術節與歐洲文化首都(ECC)的移動策略概念相近，藉由「移動」的特性，喚起地方意識。地景藝術節每年擇定不同展區，藉由藝術節翻轉空間、提升公共建設、擾動社區社群，重新認識桃園每一處地方，也藉由市府及民間資源的投入，讓各區域再次被大家認識。無圍牆美術館每年超過30件作品在大地上，桃園地景藝術節以三大主軸－「地方覺醒」、「社區風動」、「藝術打樁」，以及四大價值─「社區參與」、「在地特色」、「環境永續」、「循環經濟」，打造在地化品牌象徵。
                </h6>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/activity/C2_315080000H_080730">
          <div className="col d-flex align-items-stretch">
            <div className="card border-0 w-100">
              <img
                className="card activity-img"
                src="https://www.taiwan.net.tw/att/event/e78f612e-a1dc-4c13-a5e7-2c1303508023.jpg"
              />
              <div className="card-img-overlay d-flex flex-column justify-content-between activity-img-mask">
                <h5 className="pb-4" style={{ width: '85%' }}>
                  2022武陵農場櫻花季
                </h5>
                <h6 className="text-truncate3">
                  武陵農場海拔高度位於1,740至2,200公尺間，自民國82年（西元1993年）開始種植櫻花樹至今約20餘載，約植有1萬6千餘株，被譽為全台賞櫻首選勝地，近年來因撫育得當，每年1至2月櫻花季期間一片粉白花海花況甚佳，在遊客主動透過部落格、臉書及網路等傳送下廣受媒體關注，於花季期間來場採訪報導，吸引數十萬民眾蜂擁上山賞花。
                </h6>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/activity/C2_315080000H_080757">
          <div className="col d-flex align-items-stretch">
            <div className="card border-0 w-100">
              <img
                className="card activity-img"
                src="https://www.taiwan.net.tw/att/event/d211f6ac-f189-45cf-aff2-683925984b5d.jpg"
              />
              <div className="card-img-overlay d-flex flex-column justify-content-between activity-img-mask">
                <h5 className="pb-4" style={{ width: '85%' }}>
                  2022南島族群婚禮
                </h5>
                <h6 className="text-truncate3">
                  本處轄區位於高屏山麓，在轄管的6個鄉區中，有5個鄉區為原住民地區，族群包含魯凱、排灣、布農及拉阿魯哇族等，呈現多元的原住民文化特色。為推廣本轄特有的原住民文化，帶動部落觀光發展，希望藉由「南島族群婚禮活動」之辦理，以原住民傳統婚禮為主軸，原鄉文化觀光組織為核心，運用觀光行銷手法，將婚禮活動包裝為具有文化特色的觀光活動，並以系列活動引導遊客漫遊高屏山麓，感受幸福原鄉。
                </h6>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/activity/C2_315080000H_080710">
          <div className="col d-flex align-items-stretch">
            <div className="card border-0 w-100">
              <img
                className="card activity-img"
                src="https://www.taiwan.net.tw/att/event/655eb243-d750-4101-9b8c-448ef98c43be.jpg"
              />
              <div className="card-img-overlay d-flex flex-column justify-content-between activity-img-mask">
                <h5 className="pb-4" style={{ width: '85%' }}>
                  2022臺東最美星空系列活動
                </h5>
                <h6 className="text-truncate3">
                  臺東最美星空系列活動整體區分為三部份，分別為導遊培訓、導覽活動和最美星空音樂會。由於臺東地域地廣人稀，即使交通比之西部來的不便，卻因此保留西部所沒有的天然環境，低汙染、低噪音、沒有高樓大廈的遮蔽，沒有嚴重的光害跟PM2.5，與西部相較之下，觀賞星星容易許多，觀星的地方多不勝數。
                </h6>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

export default HomeActivities;
