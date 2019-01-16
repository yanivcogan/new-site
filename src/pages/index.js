import React from "react";
import PropTypes from "prop-types";
import Responsive from "react-responsive";
import Content, { HTMLContent } from "../components/Content";
import "../style/join-page.scss";

const Mobile = props => <Responsive {...props} maxWidth={767} />;
const Default = props => <Responsive {...props} minWidth={768} />;

export const SplashPageTemplate = ({
  title,
  headerImage,
  subhed,
  content,
  bgimg,
  contentComponent,
  youtubeVideo,
  mobile
}) => {
  const PageContent = contentComponent || Content;

  return (
    <div
      className="full-height"
      style={
        youtubeVideo
          ? { backgroundColor: "#f7fcfd" }
          : { backgroundImage: `url(${bgimg})` }
      }
    >
      <div
        className="splash"
        style={youtubeVideo ? { display: "flex", alignItems: "center" } : {}}
      >
        {youtubeVideo && !mobile && (
          <iframe
            style={{ float: "left" }}
            width="60%"
            height="400"
            src={youtubeVideo}
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        )}
        <div
          style={!mobile ? { width: "40%" } : { width: "100%" }}
          className="join-page-content-container"
        >
          <div className="row">
            <div className="hed">
              <img
                src={headerImage}
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
              />
            </div>
          </div>

          {youtubeVideo && mobile && (
            <iframe
              style={{ margin: 10 }}
              width="100%"
              height="300"
              src={youtubeVideo}
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          )}

          <div className="row">
            <div
              className="subhed medium-m"
              style={
                youtubeVideo
                  ? { color: "#00769c", marginTop: 30 }
                  : { marginTop: 30 }
              }
            >
              {subhed}
            </div>
          </div>
          <div className="row" style={{ marginTop: 50 }}>
            <form
              className="splash-signup"
              name="splash-signup"
              data-netlify="true"
              netlify="true"
              data-netlify-honeypot="bot-field"
              method="post"
              action="/home"
            >
              <input type="hidden" name="form-name" value="splash-signup" />
              <div className="inputs-container">
                <input
                  className="splash-input"
                  type="text"
                  name="name"
                  placeholder="Name"
                  required="true"
                />
                <input
                  className="splash-input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  required="true"
                />
                <input
                  className="splash-input"
                  type="text"
                  maxLength="5"
                  minLength="5"
                  name="zip"
                  placeholder="Zip"
                  required="true"
                />
                <input
                  className="splash-input"
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                />
              </div>
              <input
                type="submit"
                name="submit"
                value="JOIN US"
                className="extra-bold-m orange-bg"
              />
            </form>
            {!youtubeVideo && (
              <div className="five columns content-container medium-m">
                <PageContent className="content" content={content} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SplashPageTemplate.propTypes = {
  title: PropTypes.string.isRequired,
  hed: PropTypes.string.isRequired,
  subhed: PropTypes.string.isRequired,
  bgimg: PropTypes.string.isRequired,
  content: PropTypes.string,
  contentComponent: PropTypes.func
};

const SplashPage = ({ data }) => {
  console.log(data);
  const { allMarkdownRemark: pages } = data;
  const page = pages.edges[0].node;

  return (
    <div>
      <Mobile>
        <SplashPageTemplate
          contentComponent={HTMLContent}
          title={page.frontmatter.title}
          headerImage={page.frontmatter.headerImage}
          subhed={page.frontmatter.subhed}
          content={page.html}
          bgimg={page.frontmatter.bgimg}
          youtubeVideo={page.frontmatter.youtubeVideo}
          mobile={true}
        />
      </Mobile>
      <Default>
        <SplashPageTemplate
          contentComponent={HTMLContent}
          title={page.frontmatter.title}
          headerImage={page.frontmatter.headerImage}
          subhed={page.frontmatter.subhed}
          content={page.html}
          bgimg={page.frontmatter.bgimg}
          youtubeVideo={page.frontmatter.youtubeVideo}
          mobile={false}
        />
      </Default>
    </div>
  );
};

SplashPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default SplashPage;

export const splashPageQuery = graphql`
  query SplashPage {
    allMarkdownRemark(filter: { frontmatter: { uniq: { eq: "join-page" } } }) {
      edges {
        node {
          html
          frontmatter {
            title
            headerImage
            subhed
            bgimg
            youtubeVideo
          }
        }
      }
    }
  }
`;
