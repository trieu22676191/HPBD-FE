import React from "react";
import "../styles/WishSection.css";

function WishSection() {
  const handleButtonClick = () => {
    const bubblesSection = document.getElementById("bubbles");
    if (bubblesSection) {
      bubblesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="wish-section" id="wish">
      <div className="wish-container">
        <div className="wish-image-container">
          <div className="wish-image-wrapper">
            <img
              src="https://res.cloudinary.com/dclomtdc3/image/upload/v1764446582/z6645223134802_b450305e2175438f74a28f637ea7235b_sxxxhj.jpg"
              alt="Diệu Hiền"
              className="wish-image"
            />
          </div>
        </div>

        <div className="wish-content">
          <h2 className="wish-header">Lời Chúc Dành Cho Bạn!</h2>
          <div className="wish-date">29/09/2025</div>
          <div className="wish-message">
            <p>
              Chào bạn! Hôm nay là một ngày đặc biệt, không chỉ vì đây là ngày
              sinh nhật của bạn mà còn vì đây là ngày để những người thân yêu và
              bạn bè gửi đến bạn những lời chúc chân thành nhất.
            </p>
            <p>
              Vào ngày sinh nhật của bạn, mình chúc bạn có một ngày thật rực rỡ,
              đầy ắp tiếng cười, niềm vui và những bất ngờ đáng yêu. Mong rằng
              tuổi mới sẽ mang đến cho bạn thật nhiều thành công, nhiều trải
              nghiệm thú vị và những người luôn yêu thương, trân trọng bạn.
            </p>
            <p>Chúc mừng sinh nhật bạn! 🎉🎂</p>
          </div>
          <button className="wish-button" onClick={handleButtonClick}>
            Rảnh tay thì bấm vào đây
          </button>
        </div>
      </div>
    </section>
  );
}

export default WishSection;
